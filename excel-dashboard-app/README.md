# 📊 Excel Dashboard App

Aplicación web para convertir cualquier archivo Excel en un dashboard interactivo.
Construida con **Streamlit**, **pandas** y **Plotly**.

## Funcionalidades

- Subida de archivos `.xlsx` / `.xls` y selección de hoja.
- Detección automática de columnas numéricas, de fecha y categóricas.
- Filtros dinámicos por categoría y rango de fechas.
- KPIs: registros, total, promedio y máximo de la métrica elegida.
- Gráficos: evolución mensual, barras y anillo por categoría, histograma.
- Tabla de datos filtrados y exportación a Excel.
- Datos de ejemplo (ventas) para probar sin archivo propio.

## Instalación

```bash
pip install -r requirements.txt
python generar_datos.py      # crea data/ventas_ejemplo.xlsx
streamlit run app.py
```

Abre http://localhost:8501 en el navegador.

## Estructura

```
app.py             # dashboard
generar_datos.py   # genera el Excel de ejemplo
data/              # archivos de datos
requirements.txt
```
