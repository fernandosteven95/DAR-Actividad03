<template>
  <div class="input-data-container">
    <h2>¿Dónde quieres ubicar una gasolinera?</h2>

    <!-- Línea separadora -->
    <hr class="separator" />

    <!-- Sección de Ubicación -->
    <div class="ubicacion-section">
      <h3 class="centered">Ubicación</h3>
      <div class="ubicacion-inputs">
        <div class="input-group">
          <label for="lat">Latitud:</label>
          <input type="text" id="lat" v-model="latitude" placeholder="Ej: 40.4168" />
        </div>
        <div class="input-group">
          <label for="lon">Longitud:</label>
          <input type="text" id="lon" v-model="longitude" placeholder="Ej: -3.7038" />
        </div>
      </div>
      <!-- Botones para obtener ubicación, ahora con mejor separación -->
      <div class="ubicacion-buttons">
        <button type="button" @click="usarUbicacionPrecisa">Usar mi ubicación precisa</button>
        <button type="button" @click="usarUbicacionAproximada">Usar mi ubicación aproximada</button>
      </div>
    </div>

    <!-- Línea separadora -->
    <hr class="separator" />

    <!-- Botón de búsqueda que ocupa todo el ancho -->
    <div class="buscar-section">
      <button type="button" class="btn-buscar full-width-button" @click="buscar">Buscar</button>
    </div>

    <!-- Sección de Filtros: visible tras hacer clic en "Buscar" -->
    <div class="filtros-section" v-if="showFilters">
      <h3 class="centered">Filtros</h3>
      <div class="filtros-content">
        <!-- Filtro de Marcas: inicia vacío -->
        <div class="filtro">
          <h4>Marcas</h4>
          <div class="scroll-container">
            <div v-for="brand in availableBrands" :key="brand" class="checkbox-item">
              <input type="checkbox" :id="brand" :value="brand" v-model="selectedBrands" />
              <label :for="brand">{{ brand }}</label>
            </div>
          </div>
        </div>
        <!-- Filtro de Tipos de Combustible: inicia vacío -->
        <div class="filtro">
          <h4>Combustibles</h4>
          <div class="scroll-container">
            <div v-for="fuel in availableFuelTypes" :key="fuel" class="checkbox-item">
              <input type="checkbox" :id="fuel" :value="fuel" v-model="selectedFuelTypes" />
              <label :for="fuel">{{ fuel }}</label>
            </div>
          </div>
        </div>
        <!-- Filtro de Distancia: slider que ocupa el ancho completo -->
        <div class="filtro">
          <h4>Distancia máxima: {{ distance }} km</h4>
          <input type="range" v-model="distance" min="1" max="200" class="full-width-slider" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InputData",
  data() {
    return {
      // Ubicación: se dejan vacíos para que el usuario ingrese o se rellenen con geolocalización
      latitude: "",
      longitude: "",
      // Opciones de marcas (puedes ajustar o generar dinámicamente)
      availableBrands: ["Repsol", "Cepsa", "BP", "Galp", "Shell"],
      // Lista actualizada de combustibles disponibles
      availableFuelTypes: [
        "biodiésel",
        "bioetanol",
        "gas natural comprimido",
        "gas natural licuado",
        "gases licuados del petróleo",
        "gasóleo A",
        "gasóleo B",
        "gasóleo C",
        "gasóleo de uso marítimo",
        "gasóleo Premium",
        "gasolina 95 E10",
        "gasolina 95 E5",
        "gasolina 95 E5 Premium",
        "gasolina 98 E10",
        "gasolina 98 E5",
        "hidrógeno"
      ],
      // Filtros seleccionados: inician vacíos para mostrar todos los resultados
      selectedBrands: [],
      selectedFuelTypes: [],
      // Distancia máxima (inicia en 200 km para no limitar resultados)
      distance: 200,
      // Control de visualización de filtros
      showFilters: false,
    };
  },
  // Watchers para emitir cambios de filtros al componente padre
  watch: {
    selectedBrands() {
      this.emitFiltros();
    },
    selectedFuelTypes() {
      this.emitFiltros();
    },
    distance() {
      this.emitFiltros();
    },
  },
  methods: {
    // Obtiene ubicación precisa usando geolocalización; actualiza los inputs con las coordenadas
    usarUbicacionPrecisa() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
              this.latitude = position.coords.latitude.toString();
              this.longitude = position.coords.longitude.toString();
              if (this.showFilters) {
                this.emitFiltros();
              }
            },
            (error) => {
              console.error("Error obteniendo ubicación precisa:", error);
            }
        );
      } else {
        console.error("La geolocalización no es soportada por este navegador.");
      }
    },
    // Obtiene ubicación aproximada por IP usando una API externa (ej. ipapi.co)
    usarUbicacionAproximada() {
      fetch("https://ipapi.co/json/")
          .then((response) => response.json())
          .then((data) => {
            this.latitude = data.latitude.toString();
            this.longitude = data.longitude.toString();
            if (this.showFilters) {
              this.emitFiltros();
            }
          })
          .catch((error) => {
            console.error("Error obteniendo ubicación aproximada:", error);
          });
    },
    // Al hacer clic en "Buscar", se muestra la sección de filtros y se emite el evento inicial
    buscar() {
      this.showFilters = true;
      this.emitFiltros();
      this.$emit("buscar-gasolineras", {
        lat: this.latitude,
        lon: this.longitude,
        selectedBrands: this.selectedBrands,
        selectedFuelTypes: this.selectedFuelTypes,
        distance: this.distance,
      });
    },
    // Emite el evento de actualización de filtros con los valores actuales
    emitFiltros() {
      this.$emit("actualizar-filtros", {
        lat: this.latitude,
        lon: this.longitude,
        selectedBrands: this.selectedBrands,
        selectedFuelTypes: this.selectedFuelTypes,
        distance: this.distance,
      });
    },
  },
};
</script>

<style scoped>.centered {
  text-align: center;
}


/* Estilos de la sección de ubicación */
.ubicacion-section {
  margin-bottom: 1em;
}
.ubicacion-inputs {
  display: flex;
  gap: 1em;
}
.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Mejor separación para los botones de ubicación */
.ubicacion-buttons {
  margin-top: 0.8em;
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
}

/* Línea separadora */
.separator {
  border: none;
  border-top: 1px solid currentColor;
  margin: 1em 0;
}

/* Estilos de la sección de filtros */
.filtros-section {
  margin-top: 1em;
}
.filtros-content {
  display: flex;
  flex-wrap: wrap;
  gap: 2em;
}
.filtro {
  flex: 1;
  min-width: 200px;
}

/* Contenedor con scroll para checkboxes */
.scroll-container {
  max-height: 150px;  /* Ajusta la altura según necesidad */
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 0.5em;
}

/* Opciones de checkboxes con algo de margen */
.checkbox-item {
  margin-bottom: 0.5em;
}

/* Slider que ocupa todo el ancho del contenedor */
.full-width-slider {
  width: 100%;
}

.full-width-button {
  width: 100%;
}

</style>
