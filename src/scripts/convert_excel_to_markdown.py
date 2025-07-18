import pandas as pd
import argparse
import os
from datetime import datetime

# --- ATENCIÓN ---
# Este script requiere librerías de Python. Si no las tienes, instálalas con:
# pip install pandas openpyxl

def convert_excel_to_markdown(input_path, output_path):
    """
    Lee un archivo Excel de precios, lo transforma y lo guarda como un archivo 
    Markdown optimizado para el sistema RAG.
    """
    try:
        # Lee la primera hoja del archivo Excel
        df = pd.read_excel(input_path)

        # --- Transformación de Datos ---
        df.columns = [c.strip() for c in df.columns]
        
        required_columns = ['Modelo', 'Precio', 'Calidad']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"El archivo Excel debe contener las columnas: {', '.join(required_columns)}")

        # Asumimos que el servicio es 'Pantalla' ya que no está en el Excel
        df['Servicio'] = 'Pantalla'

        # Convertimos la columna 'Precio' a número para poder operar con ella
        # El parámetro 'coerce' convertirá los valores no numéricos en NaN (Not a Number)
        df['Precio'] = pd.to_numeric(df['Precio'], errors='coerce')
        
        # Normalizar calidad para manejar variaciones
        df['Calidad'] = df['Calidad'].str.strip().str.title()
        df['Calidad'] = df['Calidad'].replace({'Cal/Orig': 'Original'})
        
        # "Pivotamos" la tabla para tener 'Original' y 'Genérica' como columnas
        price_pivot = df.pivot_table(
            index=['Modelo', 'Servicio'],
            columns='Calidad',
            values='Precio',
            aggfunc='first',
            fill_value=None
        ).reset_index()
        
        # Renombramos las columnas para que coincidan con el formato Markdown deseado
        price_pivot = price_pivot.rename(columns={
            'Original': 'Original',
            'Generica': 'Genérica'
        })

        # Rellenamos precios faltantes con 'N/A'
        price_pivot.fillna('N/A', inplace=True)
        
        # Agregamos columnas de marcador de posición que no están en el Excel
        price_pivot['En establecimiento'] = 'Mismo día (antes 4PM) / Siguiente día'
        price_pivot['A domicilio'] = '45-60 min'

        # Nos aseguramos de que todas las columnas finales estén presentes
        final_columns = ['Modelo', 'Servicio', 'Original', 'Genérica', 'En establecimiento', 'A domicilio']
        for col in final_columns:
            if col not in price_pivot.columns:
                price_pivot[col] = 'N/A'
        
        price_pivot = price_pivot[final_columns]

        # --- Generación de Markdown ---
        brand_name = os.path.basename(input_path).replace('.xlsx', '')
        today_date = datetime.now().strftime('%Y-%m-%d')

        # Encabezado
        md_content = f"# Precios {brand_name} - SalvaCell\n\n"
        md_content += "## Información General\n"
        md_content += f"- **Última actualización:** {today_date}\n"
        md_content += "- **Moneda:** Pesos Mexicanos (MXN)\n"
        md_content += "- **Garantía estándar:** 30 días original, 15 días genérica\n"
        md_content += "- **Nota:** En el establecimiento, si el equipo se entrega antes de las 4 PM, el servicio se realiza el mismo día; si es después, se realiza al día siguiente.\n"
        md_content += "- **A domicilio:** El servicio toma entre 45 minutos y 1 hora una vez iniciado en el lugar acordado.\n\n"
        
        # Tabla de Precios
        md_content += "## Tabla de Precios\n\n"
        md_content += price_pivot.to_markdown(index=False)
        md_content += "\n\n"

        # Bloque de Metadatos para el Agente
        md_content += "## Metadatos para Sofia\n"
        md_content += "```yaml\n"
        md_content += f"marca: {brand_name}\n"
        md_content += f"modelos_disponibles: {len(price_pivot)}\n"
        md_content += "servicios: [pantalla, batería, cámara, puerto]\n"
        md_content += "tiempo_promedio: 52 minutos\n"
        md_content += "garantia_original: 30 días\n"
        md_content += "garantia_generica: 15 días\n"
        md_content += "```\n"

        # Escribir el contenido en el archivo de salida
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
            
        print(f"¡Éxito! Archivo convertido y guardado en: {output_path}")

    except FileNotFoundError:
        print(f"Error: No se encontró el archivo de entrada en la ruta: {input_path}")
    except Exception as e:
        print(f"Ocurrió un error inesperado: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Convierte un archivo Excel de precios a un archivo Markdown optimizado."
    )
    parser.add_argument(
        "--input", 
        type=str, 
        required=True, 
        help="Ruta del archivo Excel de entrada."
    )
    parser.add_argument(
        "--output", 
        type=str, 
        required=True, 
        help="Ruta del archivo Markdown de salida."
    )
    
    args = parser.parse_args()
    
    convert_excel_to_markdown(args.input, args.output)
