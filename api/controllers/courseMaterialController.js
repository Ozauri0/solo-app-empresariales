const CourseMaterial = require('../models/CourseMaterial');
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

// Obtener todos los materiales de un curso
exports.getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log(`Solicitud para obtener materiales del curso: ${courseId} por usuario: ${req.user.id} (${req.user.role})`);
    
    // PRIMERA VERIFICACIÓN: Si el usuario es administrador, permitir acceso inmediato
    if (req.user.role === 'admin') {
      const materials = await CourseMaterial.find({ course: courseId })
        .populate('uploadedBy', 'name username email')
        .sort({ uploadedAt: -1 });
      
      return res.status(200).json({
        success: true,
        count: materials.length,
        materials
      });
    }
    
    // VERIFICACIÓN DIRECTA: Comprobar si el usuario es instructor o estudiante del curso
    try {
      // Realizar una verificación directa en la base de datos sin populate
      const courseDirectCheck = await Course.findOne({
        _id: courseId,
        $or: [
          { instructor: req.user.id },
          { students: req.user.id }
        ]
      });
      
      // Si encontramos el curso, significa que el usuario es instructor o estudiante
      if (courseDirectCheck) {
        console.log(`Verificación directa: Usuario ${req.user.id} tiene acceso al curso ${courseId}`);
        const materials = await CourseMaterial.find({ course: courseId })
          .populate('uploadedBy', 'name username email')
          .sort({ uploadedAt: -1 });
        
        return res.status(200).json({
          success: true,
          count: materials.length,
          materials
        });
      }
    } catch (directCheckError) {
      console.error(`Error en verificación directa: ${directCheckError.message}`);
      // No retornamos error aquí, continuamos con los otros métodos de verificación
    }
    
    // Si llegamos aquí, el usuario no tiene acceso según la verificación directa
    // Obtenemos los detalles completos del curso para logs de depuración
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }
    
    // Información de depuración detallada
    console.log(`Detalles del curso: ${courseId}`);
    console.log(`Instructor: ${course.instructor}`);
    console.log(`Estudiantes: ${JSON.stringify(course.students)}`);
    console.log(`Usuario solicitante: ${req.user.id}`);
    
    // Comprobación final explícita
    const isInstructor = course.instructor && course.instructor.toString() === req.user.id;
    const isStudent = Array.isArray(course.students) && 
                      course.students.map(s => s.toString()).includes(req.user.id);
    
    console.log(`Es instructor: ${isInstructor}, Es estudiante: ${isStudent}`);
    
    // Decisión final de acceso
    if (isInstructor || isStudent) {
      const materials = await CourseMaterial.find({ course: courseId })
        .populate('uploadedBy', 'name username email')
        .sort({ uploadedAt: -1 });
      
      return res.status(200).json({
        success: true,
        count: materials.length,
        materials
      });
    }
    
    // Si ninguna verificación tiene éxito, denegar acceso
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para ver estos materiales'
    });
  } catch (error) {
    console.error(`Error en getCourseMaterials: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error al obtener materiales del curso',
      error: error.message
    });
  }
};

// Obtener un material específico
exports.getCourseMaterial = async (req, res) => {
  try {
    const { courseId, materialId } = req.params;
    console.log(`Solicitud para obtener material: ${materialId} del curso: ${courseId} por usuario: ${req.user.id} (${req.user.role})`);
    
    // Buscar el material
    const material = await CourseMaterial.findOne({
      _id: materialId,
      course: courseId
    }).populate('uploadedBy', 'name username email');
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material no encontrado'
      });
    }
    
    // Si es admin, permitir acceso
    if (req.user.role === 'admin') {
      return res.status(200).json({
        success: true,
        material
      });
    }
    
    // Verificación directa en la base de datos
    const courseCheck = await Course.findOne({
      _id: courseId,
      $or: [
        { instructor: req.user.id },
        { students: req.user.id }
      ]
    });
    
    if (courseCheck) {
      console.log(`Usuario ${req.user.id} tiene acceso al material ${materialId}`);
      return res.status(200).json({
        success: true,
        material
      });
    }
    
    // Si no tiene acceso, denegar
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para ver este material'
    });
    
  } catch (error) {
    console.error(`Error en getCourseMaterial: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el material',
      error: error.message
    });
  }
};

// Crear un nuevo material para el curso
exports.createCourseMaterial = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;
    
    console.log(`Intento de subir material al curso ${courseId} por usuario: ${req.user.id} (${req.user.role})`);
    
    // Verificar si existe el curso
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }
    
    // Verificar si el usuario es profesor o administrador
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      console.log(`Usuario ${req.user.id} no tiene permisos para subir materiales al curso ${courseId}`);
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para subir materiales a este curso'
      });
    }
    
    // Verificar si se subió un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Es necesario subir un archivo'
      });
    }
    
    // Asegurar que el directorio de destino exista
    const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'course-materials');
    if (!fs.existsSync(uploadDir)) {
      console.log(`Creando directorio de materiales: ${uploadDir}`);
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
      } catch (mkdirError) {
        console.error(`Error al crear directorio: ${mkdirError.message}`);
        return res.status(500).json({
          success: false,
          message: 'Error al crear directorio para guardar el archivo',
          error: mkdirError.message
        });
      }
    }
    
    // Crear URL para el archivo
    const fileUrl = `/uploads/course-materials/${req.file.filename}`;
    console.log(`Ruta del archivo: ${fileUrl}`);
    
    // Crear el nuevo material
    const material = new CourseMaterial({
      title,
      description,
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      course: courseId,
      uploadedBy: req.user.id
    });
    
    await material.save();
    
    res.status(201).json({
      success: true,
      message: 'Material subido exitosamente',
      material
    });
  } catch (error) {
    console.error(`Error en createCourseMaterial: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error al subir el material',
      error: error.message
    });
  }
};

// Actualizar un material existente
exports.updateCourseMaterial = async (req, res) => {
  try {
    const { courseId, materialId } = req.params;
    const { title, description } = req.body;
    
    // Buscar el material
    let material = await CourseMaterial.findOne({
      _id: materialId,
      course: courseId
    });
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material no encontrado'
      });
    }
    
    // Verificar si el usuario es profesor o administrador
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar este material'
      });
    }
    
    // Actualizar campos básicos
    material.title = title || material.title;
    material.description = description || material.description;
    
    // Manejar actualización de archivo si se proporciona uno nuevo
    if (req.file) {
      // Eliminar archivo anterior si existe
      try {
        const oldFilePath = path.join(__dirname, '..', '..', 'public', material.fileUrl);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch (unlinkError) {
        console.error('Error al eliminar el archivo anterior:', unlinkError);
        // Continuamos el proceso aunque haya fallos al eliminar el archivo antiguo
      }
      
      // Crear URL para el nuevo archivo
      const fileUrl = `/uploads/course-materials/${req.file.filename}`;
      
      // Actualizar propiedades del archivo
      material.fileUrl = fileUrl;
      material.fileName = req.file.originalname;
      material.fileType = req.file.mimetype;
      material.fileSize = req.file.size;
    }
    
    // Guardar cambios
    await material.save();
    
    res.status(200).json({
      success: true,
      message: 'Material actualizado exitosamente',
      material
    });
  } catch (error) {
    console.error(`Error en updateCourseMaterial: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el material',
      error: error.message
    });
  }
};

// Eliminar un material
exports.deleteCourseMaterial = async (req, res) => {
  try {
    const { courseId, materialId } = req.params;
    
    // Buscar el material
    const material = await CourseMaterial.findOne({
      _id: materialId,
      course: courseId
    });
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material no encontrado'
      });
    }
    
    // Verificar si el usuario es profesor o administrador
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este material'
      });
    }
    
    // Eliminar el archivo si existe
    try {
      const filePath = path.join(__dirname, '..', '..', 'public', material.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (unlinkError) {
      console.error('Error al eliminar el archivo del material:', unlinkError);
      // Continuamos el proceso aunque haya fallos al eliminar el archivo
    }
    
    // Eliminar el material de la base de datos
    await CourseMaterial.deleteOne({ _id: materialId });
    
    res.status(200).json({
      success: true,
      message: 'Material eliminado exitosamente'
    });
  } catch (error) {
    console.error(`Error en deleteCourseMaterial: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el material',
      error: error.message
    });
  }
};