"""Genera un archivo Excel de ejemplo con ventas para probar el dashboard."""
from pathlib import Path

import numpy as np
import pandas as pd

SALIDA = Path(__file__).parent / "data" / "ventas_ejemplo.xlsx"


def generar(filas: int = 1500, semilla: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(semilla)
    productos = {
        "Laptop": ("Tecnología", 950),
        "Monitor": ("Tecnología", 220),
        "Teclado": ("Accesorios", 45),
        "Mouse": ("Accesorios", 25),
        "Silla": ("Mobiliario", 180),
        "Escritorio": ("Mobiliario", 320),
    }
    nombres = list(productos)
    fechas = pd.to_datetime("2025-01-01") + pd.to_timedelta(
        rng.integers(0, 365, filas), unit="D"
    )
    producto = rng.choice(nombres, filas)
    cantidad = rng.integers(1, 10, filas)
    precio = np.array([productos[p][1] for p in producto]) * rng.uniform(0.9, 1.1, filas)

    df = pd.DataFrame(
        {
            "Fecha": fechas,
            "Región": rng.choice(["Norte", "Sur", "Centro", "Este", "Oeste"], filas),
            "Vendedor": rng.choice(["Ana", "Luis", "Marta", "Carlos", "Sofía"], filas),
            "Categoría": [productos[p][0] for p in producto],
            "Producto": producto,
            "Cantidad": cantidad,
            "Precio unitario": precio.round(2),
        }
    )
    df["Total"] = (df["Cantidad"] * df["Precio unitario"]).round(2)
    return df.sort_values("Fecha").reset_index(drop=True)


if __name__ == "__main__":
    SALIDA.parent.mkdir(exist_ok=True)
    generar().to_excel(SALIDA, sheet_name="Ventas", index=False)
    print(f"Archivo creado: {SALIDA}")
