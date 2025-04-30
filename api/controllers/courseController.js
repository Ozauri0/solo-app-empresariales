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
    console.log(`Usuario (ID: ${req.user.id}, Rol: ${req.user.role}) solicitando acceso al curso ${req.params.id}`);
    
    // Obtener curso directamente sin popular primero (para verificaciones)
    const courseRaw = await Course.findById(req.params.id);
    
    if (!courseRaw) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }
    
    // Verificación directa en la base de datos primero
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    // Verificación directa de si el usuario es instructor del curso
    console.log(`Comparando instructor del curso (${courseRaw.instructor}) con usuario (${userId})`);
    
    // Datos en bruto de la base de datos para depuración
    console.log(`Datos en bruto: 
      - ID del curso: ${courseRaw._id}
      - ID del instructor: ${courseRaw.instructor}
      - ID del usuario: ${userId}
      - Tipo del instructor: ${typeof courseRaw.instructor}
      - Valor del instructor: ${courseRaw.instructor.toString()}
      - ¿Son iguales?: ${courseRaw.instructor.toString() === userId}`);
    
    // Realizar verificación directa mediante consulta a la base de datos
    const isInstructorQuery = await Course.findOne({
      _id: req.params.id,
      instructor: userId
    });
    
    console.log(`Resultado de consulta directa para instructor: ${isInstructorQuery ? 'Encontrado' : 'No encontrado'}`);
    
    // Verificar si es estudiante mediante consulta
    const isStudentQuery = await Course.findOne({
      _id: req.params.id,
      students: userId
    });
    
    console.log(`Resultado de consulta directa para estudiante: ${isStudentQuery ? 'Encontrado' : 'No encontrado'}`);
    
    // Determinar acceso basado en las consultas directas
    if (isAdmin || isInstructorQuery || isStudentQuery) {
      // Obtener curso con datos populados para la respuesta
      const coursePopulated = await Course.findById(req.params.id)
        .populate('instructor', 'name email username')
        .populate('students', 'name email username');
      
      console.log(`Acceso permitido para usuario ${userId} al curso ${req.params.id}`);
      return res.status(200).json({
        success: true,
        course: coursePopulated
      });
    }
    
    // Si no tiene acceso
    console.log(`Acceso denegado para usuario ${userId} al curso ${req.params.id}`);
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para ver este curso'
    });
    
  } catch (error) {
    console.error(`Error en getCourseById: ${error.message}`);
    console.error(error);
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
      instructorId,
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
      instructor: instructorId || req.user.id, // Usar instructorId si existe, si no usar el ID del usuario actual
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
      instructorId, 
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
          instructor: instructorId || course.instructor, // Permitir actualizar el instructor
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

// Actualizar imagen de curso
exports.updateCourseImage = async (req, res) => {
  try {
    // Verificar si hay un archivo en la solicitud
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ninguna imagen'
      });
    }

    // Buscar el curso por ID
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Verificar si el usuario es el instructor o un administrador
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este curso'
      });
    }

    // Construir la ruta de la imagen
    const imagePath = `/uploads/courses/${req.file.filename}`;

    // Actualizar la imagen del curso
    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { image: imagePath } },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email username');

    res.status(200).json({
      success: true,
      message: 'Imagen del curso actualizada exitosamente',
      course
    });
  } catch (error) {
    console.error('Error al actualizar la imagen del curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la imagen del curso',
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