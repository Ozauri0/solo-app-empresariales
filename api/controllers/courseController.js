const Course = require('../models/Course');
const User = require('../models/User');

// Obtener todos los cursos (filtrados según el rol del usuario)
exports.getAllCourses = async (req, res) => {
  try {
    let courses;
    
    // Filtrar según el rol del usuario
    if (req.user.role === 'student') {
      // Estudiantes: ver solo cursos en los que están inscritos
      courses = await Course.find({ students: req.user.id })
        .populate('instructor', 'name email username')
        .sort({ createdAt: -1 });
    } 
    else if (req.user.role === 'teacher') {
      // Profesores: ver solo cursos que imparten
      courses = await Course.find({ instructor: req.user.id })
        .populate('instructor', 'name email username')
        .sort({ createdAt: -1 });
    }
    else if (req.user.role === 'admin') {
      // Administradores: ver todos los cursos
      courses = await Course.find()
        .populate('instructor', 'name email username')
        .sort({ createdAt: -1 });
    }
    
    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los cursos',
      error: error.message
    });
  }
};

// Obtener un curso por ID
exports.getCourseById = async (req, res) => {
  try {
    // Obtener el curso con información de instructor y estudiantes
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email username')
      .populate('students', 'name email username');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }
    
    // Verificación mejorada para permisos de acceso
    const isAdmin = req.user.role === 'admin';
    const isInstructor = course.instructor && 
      course.instructor._id && 
      course.instructor._id.toString() === req.user.id;
    
    // Verificación exhaustiva para estudiantes
    let isStudent = false;
    const userId = req.user.id;
    
    // Método 1: Verificar en el array populado
    if (course.students && course.students.length > 0) {
      isStudent = course.students.some(student => 
        (student._id && student._id.toString() === userId)
      );
    }
    
    // Método 2: Verificar en el array de IDs no populado (accediendo al documento interno)
    if (!isStudent && course._doc && course._doc.students && Array.isArray(course._doc.students)) {
      isStudent = course._doc.students.some(studentId => 
        studentId.toString() === userId
      );
    }
    
    // Método 3: Verificar con una búsqueda directa en la base de datos
    if (!isStudent) {
      const courseCheck = await Course.findOne({
        _id: req.params.id,
        students: userId
      });
      isStudent = !!courseCheck;
    }
    
    console.log(`Usuario ${userId} verificando acceso al curso ${req.params.id}`);
    console.log(`Es admin: ${isAdmin}, Es instructor: ${isInstructor}, Es estudiante: ${isStudent}`);
    
    // Denegar acceso si no tiene permisos
    if (!isAdmin && !isInstructor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este curso'
      });
    }
    
    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error(`Error en getCourseById: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el curso',
      error: error.message
    });
  }
};

// Crear un nuevo curso
exports.createCourse = async (req, res) => {
  try {
    const { 
      title, 
      code, 
      description, 
      schedule, 
      startDate, 
      endDate 
    } = req.body;

    // Verificar si ya existe un curso con el mismo código
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un curso con este código'
      });
    }

    // Crear el nuevo curso
    const course = new Course({
      title,
      code,
      description,
      instructor: req.user.id,
      schedule,
      startDate,
      endDate
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el curso',
      error: error.message
    });
  }
};

// Actualizar un curso
exports.updateCourse = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      schedule, 
      startDate, 
      endDate 
    } = req.body;

    // Buscar el curso por ID
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Verificar si el usuario es el instructor o un administrador
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este curso'
      });
    }

    // Actualizar el curso
    course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          title: title || course.title,
          description: description || course.description,
          schedule: schedule || course.schedule,
          startDate: startDate || course.startDate,
          endDate: endDate || course.endDate
        }
      },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email username');

    res.status(200).json({
      success: true,
      message: 'Curso actualizado exitosamente',
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el curso',
      error: error.message
    });
  }
};

// Eliminar un curso
exports.deleteCourse = async (req, res) => {
  try {
    // Buscar el curso por ID
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Verificar si el usuario es el instructor o un administrador
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este curso'
      });
    }

    // Eliminar el curso
    await course.remove();

    res.status(200).json({
      success: true,
      message: 'Curso eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el curso',
      error: error.message
    });
  }
};

// Inscribir estudiante en un curso
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    
    // Buscar el curso por ID
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Verificar si el usuario es el instructor o un administrador
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para inscribir estudiantes en este curso'
      });
    }

    // Verificar si el estudiante existe
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Estudiante no encontrado'
      });
    }

    // Verificar si el estudiante ya está inscrito
    if (course.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'El estudiante ya está inscrito en este curso'
      });
    }

    // Agregar estudiante al curso
    course.students.push(studentId);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Estudiante inscrito exitosamente',
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al inscribir al estudiante',
      error: error.message
    });
  }
};

// Eliminar estudiante de un curso
exports.removeStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    
    // Buscar el curso por ID
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Verificar si el usuario es el instructor o un administrador
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar estudiantes de este curso'
      });
    }

    // Verificar si el estudiante está inscrito
    if (!course.students.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'El estudiante no está inscrito en este curso'
      });
    }

    // Eliminar estudiante del curso
    course.students = course.students.filter(
      student => student.toString() !== studentId
    );
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Estudiante eliminado exitosamente del curso',
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar al estudiante del curso',
      error: error.message
    });
  }
};