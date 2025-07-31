# Exploring Sicily's Fire

## Understanding the Data Visualization

This interactive map presents a comprehensive analysis of fire-affected areas in Sicily, combining historical records from the Sicilian Forest Information System (SIF) with real-time satellite detection data from the European Forest Fire Information System (EFFIS). The visualization serves as both a research tool and a monitoring platform for understanding fire patterns and regulatory compliance.

## What You'll Observe

### **Historical Fire Patterns (2010-2022)**
The map displays fire-affected areas as gray polygons, each representing a documented fire perimeter from the SIF database. These polygons contain detailed attribute data including location coordinates, fire start dates, affected area measurements in hectares, and administrative classifications.

Red symbols overlay areas where municipalities have failed to maintain required fire registries, providing a visual indicator of regulatory compliance gaps. This color coding enables rapid identification of administrative areas requiring intervention or support.

### **Current Fire Monitoring**
Active fire detection data appears as colored symbols across the landscape. Orange and red circles represent current fires detected by multiple satellite systems:
- **SUOMI VIIRS C2**: Suomi NPP satellite thermal detection
- **J1 VIIRS C2**: NOAA-20 satellite thermal detection
- **MODIS C6.1**: Terra/Aqua satellite thermal detection

Symbol color intensity correlates with fire brightness temperature, providing a proxy for fire intensity and heat output.

## Navigation and Analysis Tools

### **Spatial Exploration**
Use mouse wheel or control buttons to adjust zoom levels. The map employs a geographic coordinate system with automatic filtering based on visible extent. Pan functionality allows examination of specific regions while maintaining spatial context.

### **Data Filtering System**
The sidebar provides hierarchical filtering capabilities:

**Temporal Filters:**
- Year selection (2010-2022) for historical analysis
- Month and day-of-week filters for seasonal pattern identification
- Date-specific filtering for detailed temporal analysis

**Spatial Filters:**
- Municipality-based filtering using administrative boundaries
- Location-specific filtering by locality names
- Compliance status filtering (compliant vs. non-compliant municipalities)

**Attribute Filters:**
- Area size categorization
- Fire intensity classification
- Administrative compliance status

### **Real-time Statistics**
The interface provides dynamic statistical updates based on current view parameters:
- Feature count of visible fire areas
- Total affected area calculation in hectares
- Municipality-level aggregations
- Temporal distribution summaries

- 

The map serves as both a monitoring tool for current fire threats and a research platform for understanding long-term fire patterns and their relationship to administrative systems and policy implementation.