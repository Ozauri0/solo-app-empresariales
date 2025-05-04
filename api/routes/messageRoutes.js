const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');
const User = require('../models/User');

// Obtener todos los mensajes del usuario
router.get('/', protect, async (req, res) => {
  try {
    // Obtener tipo de mensajes a buscar (recibidos, enviados o todos)
    const { type } = req.query;
    let query = {};
    
    if (type === 'sent') {
      // Mensajes enviados
      query = { sender: req.user.id };
    } else if (type === 'received') {
      // Mensajes recibidos
      query = { recipient: req.user.id };
    } else {
      // Todos los mensajes
      query = {
        $or: [{ sender: req.user.id }, { recipient: req.user.id }]
      };
    }
    
    const messages = await Message.find(query)
      .populate('sender', 'name username email')
      .populate('recipient', 'name username email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los mensajes',
      error: error.message
    });
  }
});

// Obtener un mensaje por ID
router.get('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name username email')
      .populate('recipient', 'name username email');
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }
    
    // Verificar si el usuario es el remitente o el destinatario
    if (message.sender._id.toString() !== req.user.id && 
        message.recipient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este mensaje'
      });
    }
    
    // Marcar como leído si el usuario es el destinatario
    if (message.recipient._id.toString() === req.user.id && !message.read) {
      message.read = true;
      await message.save();
    }
    
    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el mensaje',
      error: error.message
    });
  }
});

// Enviar un nuevo mensaje
router.post('/', protect, async (req, res) => {
  try {
    const { recipient, subject, content, attachments } = req.body;
    
    // Verificar si el destinatario existe
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: 'Destinatario no encontrado'
      });
    }
    
    const message = new Message({
      sender: req.user.id,
      recipient,
      subject,
      content,
      attachments: attachments || []
    });
    
    await message.save();
    
    // Poblar los datos del remitente y destinatario para la respuesta
    await message.populate('sender', 'name username email');
    await message.populate('recipient', 'name username email');
    
    res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje',
      error: error.message
    });
  }
});

// Eliminar un mensaje
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }
    
    // Verificar si el usuario es el remitente o el destinatario
    if (message.sender.toString() !== req.user.id && 
        message.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este mensaje'
      });
    }
    
    await message.remove();
    
    res.status(200).json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el mensaje',
      error: error.message
    });
  }
});

// Marcar mensaje como leído
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }
    
    // Verificar si el usuario es el destinatario
    if (message.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para marcar este mensaje como leído'
      });
    }
    
    message.read = true;
    await message.save();
    
    res.status(200).json({
      success: true,
      message: 'Mensaje marcado como leído'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al marcar el mensaje como leído',
      error: error.message
    });
  }
});

// Obtener mensajes no leídos
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user.id,
      read: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el conteo de mensajes no leídos',
      error: error.message
    });
  }
});

module.exports = router;