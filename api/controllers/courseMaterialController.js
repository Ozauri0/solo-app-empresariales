const CourseMaterial = require('../models/CourseMaterial');
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

// Obtener todos los materiales de un curso
exports.getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verificar si existe el curso
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }
    
    // Verificar si el usuario tiene acceso al curso
    const isInstructor = course.instructor.toString() === req.user.id;
    const isStudent = course.students.some(student => student.toString() === req.user.id);
    
    if (req.user.role !== 'admin' && !isInstructor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estos materiales'
      });
    }
    
    // Obtener materiales
    const materials = await CourseMaterial.find({ course: courseId })
      .populate('uploadedBy', 'name username email')
      .sort({ uploadedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: materials.length,
      materials
    });
  } catch (error) {
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
    
    // Verificar si el usuario tiene acceso al curso
    const course = await Course.findById(courseId);
    const isInstructor = course.instructor.toString() === req.user.id;
    const isStudent = course.students.some(student => student.toString() === req.user.id);
    
    if (req.user.role !== 'admin' && !isInstructor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este material'
      });
    }
    
    res.status(200).json({
      success: true,
      material
    });
  } catch (error) {
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
    
    // Verificar si existe el curso
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }
    
    // Verificar si el usuario es instructor del curso o admin
    const isInstructor = course.instructor.toString() === req.user.id;
    
    if (req.user.role !== 'admin' && !isInstructor) {
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
    
    // Crear URL para el archivo (ajustar según configuración del servidor)
    const fileUrl = `/uploads/course-materials/${req.file.filename}`;
    
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
    
    // Verificar si el usuario es instructor del curso o admin
    const course = await Course.findById(courseId);
    const isInstructor = course.instructor.toString() === req.user.id;
    const isUploader = material.uploadedBy.toString() === req.user.id;
    
    if (req.user.role !== 'admin' && !isInstructor && !isUploader) {
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
      const oldFilePath = path.join(__dirname, '..', '..', 'public', material.fileUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
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
    
    // Verificar si el usuario es instructor del curso o admin
    const course = await Course.findById(courseId);
    const isInstructor = course.instructor.toString() === req.user.id;
    const isUploader = material.uploadedBy.toString() === req.user.id;
    
    if (req.user.role !== 'admin' && !isInstructor && !isUploader) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este material'
      });
    }
    
    // Eliminar el archivo si existe (ajustar según configuración del servidor)
    const filePath = path.join(__dirname, '..', '..', 'public', material.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Eliminar el material de la base de datos
    await material.remove();
    
    res.status(200).json({
      success: true,
      message: 'Material eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el material',
      error: error.message
    });
  }
};