"""Dashboard interactivo para analizar archivos Excel."""
from io import BytesIO
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

EJEMPLO = Path(__file__).parent / "data" / "ventas_ejemplo.xlsx"

st.set_page_config(page_title="Excel Dashboard", page_icon="📊", layout="wide")


@st.cache_data
def leer_excel(contenido: bytes) -> dict[str, pd.DataFrame]:
    return pd.read_excel(BytesIO(contenido), sheet_name=None)


def a_excel(df: pd.DataFrame) -> bytes:
    buffer = BytesIO()
    df.to_excel(buffer, index=False, sheet_name="Filtrado")
    return buffer.getvalue()


# --- Carga de datos ---------------------------------------------------------
st.sidebar.title("📊 Excel Dashboard")
archivo = st.sidebar.file_uploader("Sube un archivo Excel", type=["xlsx", "xls"])

if archivo is not None:
    hojas = leer_excel(archivo.getvalue())
elif EJEMPLO.exists():
    st.sidebar.info("Usando datos de ejemplo. Sube tu propio archivo para analizarlo.")
    hojas = leer_excel(EJEMPLO.read_bytes())
else:
    st.title("📊 Excel Dashboard")
    st.write("Sube un archivo Excel o ejecuta `python generar_datos.py` para crear uno de ejemplo.")
    st.stop()

hoja = st.sidebar.selectbox("Hoja", list(hojas))
df = hojas[hoja].copy()

numericas = df.select_dtypes("number").columns.tolist()
fechas = df.select_dtypes("datetime").columns.tolist()
categoricas = [c for c in df.columns if c not in numericas + fechas and df[c].nunique() <= 50]

if not numericas:
    st.error("La hoja seleccionada no tiene columnas numéricas para analizar.")
    st.stop()

# --- Filtros ---------------------------------------------------------------
st.sidebar.header("Filtros")
for col in categoricas:
    opciones = sorted(df[col].dropna().astype(str).unique())
    elegidas = st.sidebar.multiselect(col, opciones, default=opciones)
    df = df[df[col].astype(str).isin(elegidas)]

if fechas:
    col_fecha = fechas[0]
    minimo, maximo = df[col_fecha].min(), df[col_fecha].max()
    if pd.notna(minimo):
        rango = st.sidebar.date_input("Rango de fechas", (minimo.date(), maximo.date()))
        if len(rango) == 2:
            inicio, fin = (pd.Timestamp(d) for d in rango)
            df = df[df[col_fecha].between(inicio, fin + pd.Timedelta(days=1), inclusive="left")]

# --- KPIs ------------------------------------------------------------------
st.title(f"📊 Dashboard · {hoja}")
metrica = st.selectbox("Métrica principal", numericas, index=len(numericas) - 1)

k1, k2, k3, k4 = st.columns(4)
k1.metric("Registros", f"{len(df):,}")
k2.metric(f"Suma de {metrica}", f"{df[metrica].sum():,.2f}")
k3.metric(f"Promedio {metrica}", f"{df[metrica].mean():,.2f}" if len(df) else "—")
k4.metric(f"Máximo {metrica}", f"{df[metrica].max():,.2f}" if len(df) else "—")

if df.empty:
    st.warning("No hay datos con los filtros actuales.")
    st.stop()

# --- Gráficos --------------------------------------------------------------
izq, der = st.columns(2)

if fechas:
    serie = df.groupby(pd.Grouper(key=fechas[0], freq="MS"))[metrica].sum().reset_index()
    izq.plotly_chart(
        px.line(serie, x=fechas[0], y=metrica, markers=True, title=f"{metrica} por mes"),
        width="stretch",
    )

if categoricas:
    dimension = der.selectbox("Agrupar por", categoricas)
    agrupado = df.groupby(dimension)[metrica].sum().sort_values(ascending=False).reset_index()
    der.plotly_chart(
        px.bar(agrupado, x=dimension, y=metrica, title=f"{metrica} por {dimension}"),
        width="stretch",
    )
    izq2, der2 = st.columns(2)
    izq2.plotly_chart(
        px.pie(agrupado, names=dimension, values=metrica, hole=0.45,
               title=f"Participación por {dimension}"),
        width="stretch",
    )
    der2.plotly_chart(
        px.histogram(df, x=metrica, nbins=30, title=f"Distribución de {metrica}"),
        width="stretch",
    )

# --- Tabla y exportación ---------------------------------------------------
with st.expander("Ver datos filtrados", expanded=False):
    st.dataframe(df, width="stretch")

st.download_button(
    "⬇️ Descargar datos filtrados (Excel)",
    a_excel(df),
    file_name=f"{hoja}_filtrado.xlsx",
    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
)
