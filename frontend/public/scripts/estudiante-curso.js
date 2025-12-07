// Script para cargar estudiante/curso

console.log("✅ Script estudiante-curso.js cargado correctamente");

// Importar servicios - usando rutas absolutas
import { getModulosBySeccion } from '/services/moduloService.js';
import { getContenidoByModulo } from '/services/moduloContenidoService.js';
import { getActividades } from '/services/actividadService.js';
import { getSecciones } from '/services/seccionService.js';
import { getCursos } from '/services/cursoService.js';
import { getMatriculasByUsuario } from '/services/matriculaService.js';

console.log("✅ Todos los servicios importados");
console.log("getActividades type:", typeof getActividades);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log("🚀 DOMContentLoaded event fired");
    
    // Obtener ID del curso desde URL
    const pathParts = window.location.pathname.split('/');
    const cursoId = parseInt(pathParts[pathParts.length - 1]);
    console.log("📌 Curso ID:", cursoId);

    // Obtener datos del usuario actual
    const user = localStorage.getItem('user');
    const userData = user ? JSON.parse(user) : null;
    const idUsuario = userData?.id_usuario;
    console.log("👤 Usuario ID:", idUsuario);

    if (!idUsuario) {
      window.location.href = '/login';
      return;
    }

    // Obtener matrículas del estudiante
    const matriculas = await getMatriculasByUsuario(idUsuario);
    
    if (!matriculas || matriculas.length === 0) {
      document.getElementById('modulos-container').innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-exclamation-circle text-4xl mb-4 text-orange-400"></i>
          <p>No estás inscrito en ningún curso</p>
        </div>
      `;
      return;
    }

    // Filtrar matrícula para el curso actual
    const matricula = matriculas.find(m => m.id_curso === cursoId);
    
    if (!matricula) {
      document.getElementById('modulos-container').innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-exclamation-circle text-4xl mb-4 text-orange-400"></i>
          <p>No estás inscrito en este curso</p>
        </div>
      `;
      return;
    }

    const idSeccion = matricula.id_seccion;
    console.log("📍 Sección ID:", idSeccion);

    // Cargar información del curso
    const cursos = await getCursos();
    const curso = cursos.find(c => c.id_curso === cursoId);

    if (curso) {
      document.getElementById('curso-nombre').textContent = curso.nombre;
      document.getElementById('curso-descripcion').textContent = curso.descripcion || 'Sin descripción';
    }

    // Cargar secciones para obtener modalidad
    const secciones = await getSecciones({ id_seccion: idSeccion });
    if (secciones.length > 0) {
      const seccion = secciones[0];
      document.getElementById('total-semanas').textContent = `Sección: ${seccion.nombre_seccion}`;
      
      if (seccion.nombre_modalidad) {
        document.getElementById('modalidad-badge').innerHTML = `
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
            ${seccion.nombre_modalidad}
          </span>
        `;
      }
    }

    // Cargar módulos
    const modulos = await getModulosBySeccion(idSeccion);
    console.log("📚 Módulos cargados:", modulos.length);
    
    if (modulos.length === 0) {
      document.getElementById('modulos-container').innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <p>Este curso no tiene módulos disponibles aún</p>
        </div>
      `;
      return;
    }

    document.getElementById('total-semanas').textContent = `Total de semanas (${modulos.length})`;

    // Cargar contenido y actividades para cada módulo
    console.log("🔄 Iniciando carga de contenido y actividades...");
    const modulosConContenido = await Promise.all(
      modulos.map(async (modulo) => {
        try {
          console.log(`🔄 Módulo ${modulo.id_modulo}: cargando contenido y actividades...`);
          const contenido = await getContenidoByModulo(modulo.id_modulo, idSeccion);
          console.log(`📍 Antes de getActividades para módulo ${modulo.id_modulo}`);
          const actividades = await getActividades({ 
            id_modulo: modulo.id_modulo, 
            id_seccion: idSeccion 
          });
          console.log(`✅ Módulo ${modulo.id_modulo}: ${actividades?.length || 0} actividades, ${contenido?.length || 0} contenidos`);
          
          return { ...modulo, contenido: contenido || [], actividades: actividades || [] };
        } catch (error) {
          console.error(`❌ Error cargando módulo ${modulo.id_modulo}:`, error);
          return { ...modulo, contenido: [], actividades: [] };
        }
      })
    );

    console.log('✅ Todos los módulos cargados:', modulosConContenido.length);
    renderModulos(modulosConContenido, idSeccion);

  } catch (error) {
    console.error('❌ Error al cargar módulos:', error);
    document.getElementById('modulos-container').innerHTML = `
      <div class="text-center text-red-500 py-8">
        <p>Error al cargar los módulos. Por favor, intenta de nuevo.</p>
      </div>
    `;
  }
});

function renderModulos(modulos, seccionId) {
  const container = document.getElementById('modulos-container');

  const html = modulos.map((modulo, index) => {
    const contenidoList = (modulo.contenido || []).map(cont => {
      const iconoTipo = {
        'video': 'fa-video text-red-600',
        'pdf': 'fa-file-pdf text-red-500',
        'archivo': 'fa-file text-blue-600',
        'link': 'fa-link text-purple-600',
        'texto': 'fa-align-left text-gray-600'
      }[cont.tipo] || 'fa-file text-gray-600';

      const enlaceContenido = cont.url_contenido 
        ? `<a href="${cont.url_contenido}" target="_blank" class="text-blue-600 hover:underline ml-2">[Abrir]</a>`
        : '';

      return `
        <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
          <i class="fas ${iconoTipo} text-lg flex-shrink-0 mt-1"></i>
          <div class="flex-1">
            <p class="font-medium text-gray-800">${cont.titulo}</p>
            ${cont.descripcion ? `<p class="text-sm text-gray-600 mt-1">${cont.descripcion}</p>` : ''}
            ${enlaceContenido}
          </div>
        </div>
      `;
    }).join('');

    const actividadesList = (modulo.actividades || []).map(act => {
      const tipoIcon = {
        'tarea': 'fa-tasks',
        'examen': 'fa-file-alt',
        'quiz': 'fa-question-circle'
      }[act.tipo] || 'fa-file-alt';

      const tipoColor = {
        'tarea': 'text-blue-600',
        'examen': 'text-red-600',
        'quiz': 'text-green-600'
      }[act.tipo] || 'text-gray-600';

      const fechaEntrega = act.fecha_entrega 
        ? new Date(act.fecha_entrega).toLocaleString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Sin fecha';

      return `
        <div class="bg-orange-50 rounded-lg p-4 border border-orange-200 hover:shadow-md transition">
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3 flex-1">
              <i class="fas ${tipoIcon} ${tipoColor} text-lg mt-1 flex-shrink-0"></i>
              <div class="flex-1">
                <p class="font-bold text-gray-800">${act.titulo}</p>
                <div class="flex items-center gap-3 text-xs text-gray-600 mt-2">
                  <span class="px-2 py-1 bg-orange-100 text-orange-700 rounded font-semibold">${act.tipo.toUpperCase()}</span>
                  <span><i class="fas fa-calendar mr-1"></i>${fechaEntrega}</span>
                  <span><i class="fas fa-star mr-1"></i>${act.puntaje_max} pts</span>
                </div>
                ${act.descripcion ? `<p class="text-sm text-gray-700 mt-2">${act.descripcion}</p>` : ''}
              </div>
            </div>
            <button onclick="abrirResponderActividad(${act.id_actividad})" class="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold flex-shrink-0">
              <i class="fas fa-pen-square mr-1"></i> Responder
            </button>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="mb-6 border rounded-lg overflow-hidden shadow">
        <div 
          class="bg-gradient-to-r from-purple-600 to-purple-700 p-4 cursor-pointer hover:from-purple-700 hover:to-purple-800 transition"
          onclick="toggleModulo('modulo-${modulo.id_modulo}')"
        >
          <div class="flex items-center justify-between text-white">
            <div class="flex items-center space-x-3">
              <i class="fas fa-chevron-down text-lg" id="icon-modulo-${modulo.id_modulo}"></i>
              <h3 class="text-lg font-bold">Semana ${index + 1}: ${modulo.nombre_modulo}</h3>
            </div>
            <div class="text-sm">
              <span class="mx-2">${modulo.contenido?.length || 0} contenidos</span>
              <span class="mx-2">${modulo.actividades?.length || 0} actividades</span>
            </div>
          </div>
        </div>
        
        <div id="modulo-${modulo.id_modulo}" class="bg-white p-6 space-y-6">
          <!-- Contenido -->
          ${contenidoList.length > 0 ? `
            <div>
              <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                <i class="fas fa-book text-purple-600 mr-2"></i>
                Contenido
              </h4>
              <div class="space-y-2">
                ${contenidoList}
              </div>
            </div>
          ` : ''}

          <!-- Actividades -->
          ${actividadesList.length > 0 ? `
            <div>
              <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                <i class="fas fa-tasks text-blue-600 mr-2"></i>
                Actividades
              </h4>
              <div class="space-y-3">
                ${actividadesList}
              </div>
            </div>
          ` : ''}

          ${contenidoList.length === 0 && actividadesList.length === 0 ? `
            <div class="text-center text-gray-500 py-8">
              <i class="fas fa-folder-open text-4xl mb-2 text-gray-300"></i>
              <p>Este módulo no tiene contenido ni actividades aún</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

window.toggleModulo = function(moduloId) {
  const modulo = document.getElementById(moduloId);
  const icon = document.getElementById(`icon-${moduloId}`);
  
  if (modulo.classList.contains('hidden')) {
    modulo.classList.remove('hidden');
    icon.classList.remove('rotate-180');
  } else {
    modulo.classList.add('hidden');
    icon.classList.add('rotate-180');
  }
};

window.abrirResponderActividad = function(idActividad) {
  console.log('Abrir responder actividad:', idActividad);
  // TODO: Implementar modal para responder actividad
};

function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-button');
  const contents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.classList.remove('active', 'border-purple-600', 'text-purple-600');
    tab.classList.add('border-transparent', 'text-gray-500');
  });
  
  contents.forEach(content => content.classList.add('hidden'));

  document.getElementById(`tab-${tabName}`).classList.add('active', 'border-purple-600', 'text-purple-600');
  document.getElementById(`tab-${tabName}`).classList.remove('border-transparent', 'text-gray-500');
  
  document.getElementById(`content-${tabName}`).classList.remove('hidden');
  const activeTab = document.getElementById(`tab-${tabName}`);
  activeTab.classList.add('active', 'border-purple-600', 'text-purple-600');
  activeTab.classList.remove('border-transparent', 'text-gray-500');

  if (tabName === 'calificaciones') {
    loadCalificaciones();
  }
}

async function loadCalificaciones() {
  const container = document.getElementById('calificaciones-container');
  
  try {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <i class="fas fa-chart-bar text-4xl mb-4 text-blue-400"></i>
        <p>Panel de calificaciones en desarrollo...</p>
      </div>
    `;
  } catch (error) {
    console.error('Error al cargar calificaciones:', error);
    container.innerHTML = `
      <div class="text-center text-red-500 py-8">
        <p>Error al cargar las calificaciones</p>
      </div>
    `;
  }
}

window.switchTab = switchTab;
