<template>
  <div class="resultados-container">
    <h2>Resultados de la búsqueda</h2>
    <ul>
      <li v-for="(station, index) in stations" :key="index">
        <h3>{{ station.brand }}</h3>
        <p>Dirección: {{ station.address }}</p>
        <p v-if="station.distance">Distancia: {{ station.distance.toFixed(2) }} km</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "Resultados",
  props: {
    stations: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.resultados-container {
  margin-top: 2em;
  width: 100%;
  max-width: 600px;
}

/* Centrar el encabezado */
.resultados-container h2 {
  text-align: center;
}

.resultados-container ul {
  list-style: none;
  padding: 0;
}
.resultados-container li {
  background: #333;
  padding: 1em;
  margin-bottom: 0.5em;
  border-radius: 14px;
}
</style>
