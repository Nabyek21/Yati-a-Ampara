class ContentService {
  constructor() {
    this.contents = new Map([
      ['1', {
        id: '1',
        module_id: '1',
        titulo: 'Introducción a HTML',
        tipo: 'VIDEO',
        url: 'https://example.com/html-intro',
        descripcion: 'Video introductorio a HTML',
        orden: 1,
        estado: 'DISPONIBLE',
        fecha_creacion: new Date()
      }],
      ['2', {
        id: '2',
        module_id: '1',
        titulo: 'HTML5 Best Practices',
        tipo: 'DOCUMENTO',
        url: 'https://example.com/html5-guide.pdf',
        descripcion: 'Guía de mejores prácticas en HTML5',
        orden: 2,
        estado: 'DISPONIBLE',
        fecha_creacion: new Date()
      }],
      ['3', {
        id: '3',
        module_id: '2',
        titulo: 'CSS Tutorial',
        tipo: 'VIDEO',
        url: 'https://example.com/css-tutorial',
        descripcion: 'Tutorial completo de CSS',
        orden: 1,
        estado: 'DISPONIBLE',
        fecha_creacion: new Date()
      }]
    ]);

    this.nextContentId = 4;
  }

  getAllContents() {
    return Array.from(this.contents.values());
  }

  getContentById(id) {
    const content = this.contents.get(id);
    if (!content) {
      throw new Error(`Contenido con ID ${id} no encontrado`);
    }
    return content;
  }

  getContentsByModule(moduleId) {
    return Array.from(this.contents.values())
      .filter(content => content.module_id === moduleId)
      .sort((a, b) => a.orden - b.orden);
  }

  createContent(data) {
    if (!data.module_id || !data.titulo || !data.tipo || !data.url) {
      throw new Error('module_id, titulo, tipo y url son requeridos');
    }

    const validTypes = ['VIDEO', 'DOCUMENTO', 'ENLACE', 'ARCHIVO'];
    if (!validTypes.includes(data.tipo)) {
      throw new Error(`Tipo debe ser uno de: ${validTypes.join(', ')}`);
    }

    const newContent = {
      id: String(this.nextContentId++),
      module_id: data.module_id,
      titulo: data.titulo,
      tipo: data.tipo,
      url: data.url,
      descripcion: data.descripcion || '',
      orden: data.orden || 1,
      estado: 'DISPONIBLE',
      fecha_creacion: new Date()
    };

    this.contents.set(newContent.id, newContent);
    return newContent;
  }

  updateContent(id, data) {
    const content = this.getContentById(id);
    
    const updatedContent = {
      ...content,
      ...data,
      id: content.id,
      fecha_creacion: content.fecha_creacion
    };

    this.contents.set(id, updatedContent);
    return updatedContent;
  }

  deleteContent(id) {
    if (!this.contents.has(id)) {
      throw new Error(`Contenido con ID ${id} no encontrado`);
    }
    this.contents.delete(id);
    return { message: 'Contenido eliminado exitosamente' };
  }

  getContentsByType(tipo) {
    return Array.from(this.contents.values()).filter(
      content => content.tipo === tipo
    );
  }

  reorderContents(moduleId, contentIds) {
    contentIds.forEach((contentId, index) => {
      const content = this.getContentById(contentId);
      if (content.module_id === moduleId) {
        content.orden = index + 1;
      }
    });
    return this.getContentsByModule(moduleId);
  }
}

export default new ContentService();
