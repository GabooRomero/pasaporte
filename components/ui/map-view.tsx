"use client"
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

export default function AttractionsMap({ attractions, scanCounts = {} }: { attractions: any[], scanCounts?: Record<string, number> }) {
    // Center point fallback (e.g. Buenos Aires)
    const center = [-34.6037, -58.3816]

    // Preparar la data para el heatmap
    // [lat, lng, intensity]
    const heatmapData = attractions
        .filter(attr => attr.latitude && attr.longitude)
        .map(attr => {
            // Intensidad base 1, más 5 por cada escaneo real
            const count = scanCounts[attr.id] || 0
            const intensity = 1 + (count * 5)
            return [parseFloat(attr.latitude), parseFloat(attr.longitude), intensity]
        });

    return (
        <MapContainer center={center as any} zoom={4} style={{ height: '100%', minHeight: '350px', width: '100%', borderRadius: '0.75rem', zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {heatmapData.length > 0 && (
                <HeatmapLayer
                    fitBoundsOnLoad={false}
                    fitBoundsOnUpdate={false}
                    points={heatmapData}
                    longitudeExtractor={(m: any) => m[1]}
                    latitudeExtractor={(m: any) => m[0]}
                    intensityExtractor={(m: any) => m[2]}
                    radius={25}
                    blur={15}
                    max={20}
                />
            )}

            {/* Capa Base de Marcadores para Atracciones sin escaneos / Bajo Contraste */}
            {attractions.filter(attr => attr.latitude && attr.longitude).map((attr) => (
                <CircleMarker
                    key={attr.id}
                    center={[parseFloat(attr.latitude), parseFloat(attr.longitude)]}
                    radius={6}
                    pathOptions={{ color: '#4F46E5', fillColor: '#4F46E5', fillOpacity: 0.9, weight: 2 }}
                >
                    <Popup>
                        <div className="font-semibold text-slate-900 text-sm">{attr.name}</div>
                        <div className="text-xs text-slate-600 mt-1">
                            Interacciones On-Chain: <span className="font-bold">{scanCounts[attr.id] || 0}</span>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    )
}
