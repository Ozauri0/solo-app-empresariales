const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const CalendarEvent = require('../models/CalendarEvent');

// Obtener todos los eventos
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // Filtrar por usuario si no es admin
    if (req.user.role !== 'admin') {
      query = {
        $or: [
          { createdBy: req.user.id },
          { participants: req.user.id }
        ]
      };
    }
    
    const events = await CalendarEvent.find(query)
      .populate('createdBy', 'name username')
      .populate('course', 'title code')
      .sort({ startDate: 1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los eventos',
      error: error.message
    });
  }
});

// Obtener un evento por ID
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
      .populate('createdBy', 'name username')
      .populate('course', 'title code')
      .populate('participants', 'name username');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    // Verificar si el usuario tiene acceso al evento
    if (req.user.role !== 'admin' && 
        event.createdBy._id.toString() !== req.user.id && 
        !event.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver este evento'
      });
    }
    
    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el evento',
      error: error.message
    });
  }
});

// Crear un nuevo evento
router.post('/', protect, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      allDay, 
      type, 
      course, 
      participants,
      color 
    } = req.body;
    
    const event = new CalendarEvent({
      title,
      description,
      startDate,
      endDate,
      allDay,
      type,
      course,
      createdBy: req.user.id,
      participants,
      color
    });
    
    await event.save();
    
    res.status(201).json({
      success: true,
      message: 'Evento creado exitosamente',
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el evento',
      error: error.message
    });
  }
});

// Actualizar un evento
router.put('/:id', protect, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      allDay, 
      type, 
      course, 
      participants,
      color
    } = req.body;
    
    // Verificar si el evento existe
    let event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    // Verificar si el usuario tiene permiso para editar
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar este evento'
      });
    }
    
    // Actualizar el evento
    event = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      { 
        title,
        description,
        startDate,
        endDate,
        allDay,
        type,
        course,
        participants,
        color
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Evento actualizado exitosamente',
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el evento',
      error: error.message
    });
  }
});

// Eliminar un evento
router.delete('/:id', protect, async (req, res) => {
  try {
    // Verificar si el evento existe
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }
    
    // Verificar si el usuario tiene permiso para eliminar
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este evento'
      });
    }
    
    await event.remove();
    
    res.status(200).json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el evento',
      error: error.message
    });
  }
});

module.exports = router;