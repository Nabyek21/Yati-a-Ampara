class IAService {
  constructor() {
    this.summaries = new Map([
      ['1', {
        id: '1',
        content_id: '1',
        titulo: 'Resumen: Introducción a HTML',
        contenido: 'HTML es el lenguaje de marcado estándar para crear páginas web. Define la estructura y el contenido de los documentos.',
        tipo: 'RESUMEN',
        usuario_id: '1',
        estado: 'COMPLETADO',
        fecha_creacion: new Date()
      }],
      ['2', {
        id: '2',
        content_id: '3',
        titulo: 'Resumen: CSS Tutorial',
        contenido: 'CSS es usado para estilizar y diseñar páginas web. Permite controlar el diseño, colores, fuentes y espaciado.',
        tipo: 'RESUMEN',
        usuario_id: '2',
        estado: 'COMPLETADO',
        fecha_creacion: new Date()
      }]
    ]);

    this.questions = new Map([
      ['1', {
        id: '1',
        content_id: '1',
        pregunta: '¿Cuál es la diferencia entre HTML y CSS?',
        respuesta: 'HTML define la estructura, CSS define el estilo',
        dificultad: 'BASICA',
        usuario_id: '1',
        fecha_creacion: new Date()
      }],
      ['2', {
        id: '2',
        content_id: '1',
        pregunta: '¿Qué es una etiqueta HTML?',
        respuesta: 'Una etiqueta HTML es un marcador que define elementos en una página web',
        dificultad: 'BASICA',
        usuario_id: '1',
        fecha_creacion: new Date()
      }]
    ]);

    this.nextSummaryId = 3;
    this.nextQuestionId = 3;
  }

  generateSummary(contentId, usuario_id) {
    const summary = {
      id: String(this.nextSummaryId++),
      content_id: contentId,
      titulo: `Resumen generado para contenido ${contentId}`,
      contenido: `Este es un resumen generado automáticamente del contenido ${contentId}. En una implementación real, este sería generado por un modelo de IA.`,
      tipo: 'RESUMEN',
      usuario_id,
      estado: 'COMPLETADO',
      fecha_creacion: new Date()
    };

    this.summaries.set(summary.id, summary);
    return summary;
  }

  getSummary(id) {
    const summary = this.summaries.get(id);
    if (!summary) {
      throw new Error(`Resumen con ID ${id} no encontrado`);
    }
    return summary;
  }

  getSummariesByContent(contentId) {
    return Array.from(this.summaries.values()).filter(
      summary => summary.content_id === contentId
    );
  }

  getAllSummaries() {
    return Array.from(this.summaries.values());
  }

  generateQuestions(contentId, cantidad = 3, dificultad = 'MEDIA') {
    const questions = [];
    
    for (let i = 0; i < cantidad; i++) {
      const question = {
        id: String(this.nextQuestionId++),
        content_id: contentId,
        pregunta: `Pregunta generada ${i + 1} sobre contenido ${contentId}`,
        respuesta: `Esta es una respuesta generada automáticamente`,
        dificultad,
        usuario_id: 'ia-system',
        fecha_creacion: new Date()
      };
      
      this.questions.set(question.id, question);
      questions.push(question);
    }

    return questions;
  }

  getQuestion(id) {
    const question = this.questions.get(id);
    if (!question) {
      throw new Error(`Pregunta con ID ${id} no encontrado`);
    }
    return question;
  }

  getQuestionsByContent(contentId) {
    return Array.from(this.questions.values()).filter(
      question => question.content_id === contentId
    );
  }

  getAllQuestions() {
    return Array.from(this.questions.values());
  }

  getQuestionsByDifficulty(dificultad) {
    return Array.from(this.questions.values()).filter(
      question => question.dificultad === dificultad
    );
  }

  generateLearningPath(userId) {
    return {
      userId,
      recomendaciones: [
        'Completar módulo de HTML básico',
        'Practicar ejercicios de CSS',
        'Revisar documentación de JavaScript'
      ],
      proximosContenidos: ['2', '3', '4'],
      estimadoTiempo: '45 minutos',
      generadoEn: new Date()
    };
  }
}

export default new IAService();
