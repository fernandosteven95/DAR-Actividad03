<template>
  <header>
    <div class="left-col">
      <InputData
          @buscar-gasolineras="iniciarBusqueda"
          @actualizar-filtros="actualizarFiltros"
      />
    </div>
  </header>

  <main>
    <div class="right-col">
      <!-- Mostrar Resultados aunque estén vacíos, para que se vea la columna -->
      <Resultados :stations="gasolinerasFiltradas" />

      <!-- Indicador de carga superpuesto o debajo de los resultados -->
      <div v-if="loading" class="loading-container">
        <!-- Ejemplo con IconLoader de Tabler -->
        <div style="text-align: center;">
          <IconLoader stroke="2" size="48" style="color: #fff;" />
          <p>Buscando</p>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer con botones -->
  <footer class="footer-buttons">
    <!-- Botón GitHub: redirige al repositorio -->
    <a href="https://github.com/fernandosteven95/DAR-Actividad03" target="_blank" title="Repositorio del proyecto">
      <IconBrandGithub stroke="2" size="32" />
    </a>
    <!-- Botón PDF: redirige a la memoria explicativa -->
    <a href="https://alumnosunir-my.sharepoint.com/:b:/g/personal/fernando_zambrano314_comunidadunir_net/ETKyQ1u2YbJCpwKzvVye0uYBF8Tjzwb7hzt3Em-JHaP7Og?e=wKq0Ji" target="_blank" title="Memoria explicativa">
      <IconFileText stroke="2" size="32" />
    </a>
  </footer>
</template>

<script>
import InputData from "./components/InputData.vue";
import Resultados from "./components/Resultados.vue";
import { IconLoader, IconBrandGithub, IconFileText } from '@tabler/icons-vue';

export default {
  name: "App",
  components: {
    InputData,
    Resultados,
    IconLoader,
    IconBrandGithub,
    IconFileText
  },
  data() {
    return {
      // Listado completo de gasolineras obtenido de la API
      gasolinerasOriginales: [],
      // Filtros actuales (inicialmente vacíos para mostrar todos los resultados)
      currentFilters: {
        lat: "",
        lon: "",
        selectedBrands: [],
        selectedFuelTypes: [],
        distance: 200,
      },
      // Estado de carga para indicar que se está buscando
      loading: false,
    };
  },
  computed: {
    // Propiedad computada que filtra el listado según currentFilters
    gasolinerasFiltradas() {
      let resultado = this.gasolinerasOriginales;

      // 1. Si hay ubicación, se calcula la distancia de cada estación y se filtra por la distancia máxima
      if (this.currentFilters.lat && this.currentFilters.lon) {
        resultado = resultado.map((est) => {
          const distance = this.calcularDistancia(
              parseFloat(this.currentFilters.lat),
              parseFloat(this.currentFilters.lon),
              est.lat,
              est.lon
          );
          return { ...est, distance };
        });
        resultado = resultado.filter(
            (est) => est.distance <= this.currentFilters.distance
        );
        resultado.sort((a, b) => a.distance - b.distance);
      }

      // 2. Filtrar por marcas: si se ha seleccionado alguna, se busca que el rótulo incluya el texto (sin distinción de mayúsculas/minúsculas)
      if (this.currentFilters.selectedBrands.length > 0) {
        resultado = resultado.filter((est) => {
          return this.currentFilters.selectedBrands.some((filter) =>
              est.brand.toLowerCase().includes(filter.toLowerCase())
          );
        });
      }

      // 3. Filtrar por combustibles: se verifica que, para al menos uno de los tipos seleccionados, exista un precio válido.
      // Nota: aquí deberás adaptar la lógica según cómo estructures los datos de precios en cada estación.
      if (this.currentFilters.selectedFuelTypes.length > 0) {
        resultado = resultado.filter((est) => {
          let cumple = false;
          this.currentFilters.selectedFuelTypes.forEach((fuel) => {
            if (fuel === "gasóleo A" && est.price95 && est.price95 > 0) cumple = true;
            if (fuel === "gasóleo B" && est.price98 && est.price98 > 0) cumple = true;
            if (fuel === "gasóleo C" && est.gasoleoA && est.gasoleoA > 0) cumple = true;
            if (fuel === "gasóleo de uso marítimo" && est.gasoleoPremium && est.gasoleoPremium > 0) cumple = true;
            if (fuel === "gasóleo Premium" && est.gasoleoPremium && est.gasoleoPremium > 0) cumple = true;
            if (fuel === "gasolina 95 E10" && est.price95 && est.price95 > 0) cumple = true;
            if (fuel === "gasolina 95 E5" && est.price98 && est.price98 > 0) cumple = true;
            if (fuel === "gasolina 95 E5 Premium" && est.gasoleoA && est.gasoleoA > 0) cumple = true;
            if (fuel === "gasolina 98 E10" && est.gasoleoPremium && est.gasoleoPremium > 0) cumple = true;
            if (fuel === "gasolina 98 E5" && est.price95 && est.price95 > 0) cumple = true;
            // Puedes agregar condiciones para los combustibles restantes, por ejemplo:
            // "biodiésel", "bioetanol", "gas natural comprimido", "gas natural licuado", "gases licuados del petróleo", "hidrógeno"
            // Considera que tendrás que mapear estos combustibles con los campos que devuelve la API.
          });
          return cumple;
        });
      }
      return resultado;
    },
  },
  methods: {
    // Se ejecuta al pulsar "Buscar" en InputData: actualiza filtros y lanza la consulta a la API
    iniciarBusqueda(datos) {
      // Actualiza los filtros iniciales
      this.currentFilters = { ...datos };
      // Activa el indicador de carga
      this.loading = true;
      const url =
          "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/";
      fetch(url)
          .then((response) => response.json())
          .then((data) => {
            // Procesa la respuesta de la API, convirtiendo los valores necesarios
            this.gasolinerasOriginales = data.ListaEESSPrecio.map((estacion) => {
              return {
                brand: estacion["Rótulo"],
                address: estacion["Dirección"],
                // Convertir latitud y longitud, reemplazando la coma decimal por punto
                lat: parseFloat(estacion["Latitud"].replace(",", ".")),
                lon: parseFloat(estacion["Longitud (WGS84)"].replace(",", ".")),
                // Convertir precios a números; adapta según los nombres reales de los campos de la API
                price95: parseFloat(estacion["Precio Gasolina 95 E5"].replace(",", ".")),
                price98: parseFloat(estacion["Precio Gasolina 98 E5"].replace(",", ".")),
                gasoleoA: parseFloat(estacion["Precio Gasoleo A"].replace(",", ".")),
                gasoleoPremium: parseFloat(estacion["Precio Gasoleo Premium"].replace(",", ".")),
              };
            });
            // Finaliza el estado de carga
            this.loading = false;
          })
          .catch((error) => {
            console.error("Error al obtener datos de la API:", error);
            this.loading = false;
          });
    },
    // Actualiza los filtros actuales cada vez que InputData emite una actualización
    actualizarFiltros(nuevosFiltros) {
      this.currentFilters = { ...this.currentFilters, ...nuevosFiltros };
    },
    // Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
    calcularDistancia(lat1, lon1, lat2, lon2) {
      const R = 6371; // Radio de la Tierra en km
      const toRad = (value) => (value * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
  },
};
</script>

<style>
#app {
  min-height: 100vh;
  color: #fff;
  background-color: #333; /* Color de fondo para que se vea detrás */
  background: url('/src/assets/fondo.png') repeat center center;
  background-size: cover;
  padding: 2em;
}

/* Estilos para el footer */
.footer-buttons {
  display: flex;
  justify-content: center; /* Centra los botones horizontalmente */
  gap: 2rem;             /* Espacio entre los botones */
  margin-top: 2rem;       /* Espacio desde el contenido superior */
}

/* estilos para que los enlaces se comporten como botones */
.footer-buttons a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease;
}
.footer-buttons a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

</style>