"use client"

import { useState, useEffect, useRef } from 'react'
import { PlusCircle, Image as ImageIcon, Loader2, LogOut, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth, supabase } from '@/lib/mock-auth'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Map } from 'lucide-react'


export default function AdminDashboard() {
    const { user, logout, isLoading: isAuthLoading } = useAuth()
    const router = useRouter()
    const [attractions, setAttractions] = useState<any[]>([])
    const [isDataLoading, setIsDataLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form state
    const [id, setId] = useState('')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    useEffect(() => {
        // Basic protection: In MVP, ensure user is logged in.
        if (!isAuthLoading && !user) {
            router.push('/')
            return
        }

        if (!isAuthLoading && user) {
            fetchAttractions()
        }
    }, [user, isAuthLoading, router])

    const fetchAttractions = async () => {
        try {
            setIsDataLoading(true)
            const { data, error } = await supabase
                .from('attractions')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setAttractions(data || [])
        } catch (err: any) {
            console.error("Error fetching attractions:", err)
            setError("No se pudieron cargar las atracciones.")
        } finally {
            setIsDataLoading(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!id || !name || !description || !imageFile) {
            setError("Por favor completa todos los campos y selecciona una imagen.")
            return
        }

        try {
            setIsSubmitting(true)
            setError(null)

            // 1. Upload Image to Supabase Storage
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${id}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('attractions_images')
                .upload(fileName, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error("Storage Error:", uploadError)
                throw new Error("No se pudo subir la imagen. Verifica los permisos de Storage.")
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('attractions_images')
                .getPublicUrl(fileName)

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('attractions')
                .insert({
                    id: id.toLowerCase().replace(/\s+/g, '-'),
                    name,
                    description,
                    latitude: latitude ? parseFloat(latitude) : null,
                    longitude: longitude ? parseFloat(longitude) : null,
                    image_url: publicUrl
                })

            if (dbError) {
                console.error("DB Error:", dbError)
                // Cleanup image if DB fails? (Optional for MVP)
                throw new Error("No se pudo guardar la atracción en la base de datos.")
            }

            // Success! Reset form and refresh list
            resetForm()
            await fetchAttractions()

        } catch (err: any) {
            console.error("Submit Error:", err)
            setError(err.message || "Ocurrió un error inesperado al guardar.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (attractId: string) => {
        if (!window.confirm(`¿Estás seguro que deseas eliminar la atracción "${attractId}"?`)) return;

        try {
            const { error } = await supabase
                .from('attractions')
                .delete()
                .eq('id', attractId)

            if (error) throw error
            await fetchAttractions()
        } catch (err) {
            console.error("Delete Error:", err)
            setError("No se pudo eliminar la atracción.")
        }
    }

    const resetForm = () => {
        setId('')
        setName('')
        setDescription('')
        setLatitude('')
        setLongitude('')
        setImageFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const downloadQR = (id: string, name: string) => {
        const svgElement = document.getElementById(`qr-code-${id}`);
        if (!svgElement) return;

        // Serialize the SVG to a string
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new window.Image();

        img.onload = () => {
            // High-resolution canvas
            const scale = 5;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;

            // Fill background white
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }

            // Trigger download as PNG
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `QR-${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svgData)));
    };

    if (isAuthLoading || isDataLoading) {
        return (
            <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5]" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0B0F19] text-white">
            {/* Header */}
            <header className="border-b border-gray-800 bg-[#111827] px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Badge className="bg-[#4F46E5] text-white hover:bg-[#4338CA]">Admin</Badge>
                    <h1 className="text-xl font-bold">Panel de Gobierno</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 hidden md:inline">{user?.email || 'Administrador'}</span>
                    <Button variant="ghost" size="sm" onClick={() => { logout(); router.push('/'); }} className="text-gray-400 hover:text-white">
                        <LogOut className="h-4 w-4 mr-2" /> Salir
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Columna Izquierda: Formulario de Alta */}
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <PlusCircle className="h-6 w-6 text-[#4F46E5]" />
                            Nueva Atracción
                        </h2>

                        <Card className="bg-[#111827] border-gray-800">
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-5">

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">ID Único (Mapea al Smart Contract)</label>
                                        <Input
                                            placeholder="ej: casa-rosada, glaciar, 3"
                                            value={id}
                                            onChange={(e) => setId(e.target.value)}
                                            className="bg-[#1F2937] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#4F46E5]"
                                        />
                                        <p className="text-xs text-gray-500">Sin espacios. Este ID se usa para el minteo On-Chain.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Nombre Oficial</label>
                                        <Input
                                            placeholder="ej: La Casa Rosada"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="bg-[#1F2937] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#4F46E5]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Descripción / Reseña Turística</label>
                                        <Textarea
                                            placeholder="Cuentale al mundo sobre este lugar..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="bg-[#1F2937] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#4F46E5] min-h-[100px]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Latitud</label>
                                            <Input
                                                placeholder="ej: -34.6037"
                                                type="number"
                                                step="any"
                                                value={latitude}
                                                onChange={(e) => setLatitude(e.target.value)}
                                                className="bg-[#1F2937] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#4F46E5]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Longitud</label>
                                            <Input
                                                placeholder="ej: -58.3816"
                                                type="number"
                                                step="any"
                                                value={longitude}
                                                onChange={(e) => setLongitude(e.target.value)}
                                                className="bg-[#1F2937] border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-[#4F46E5]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Fotografía Oficial</label>
                                        <div
                                            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${imagePreview ? 'border-[#4F46E5] bg-[#4F46E5]/10' : 'border-gray-700 hover:border-gray-500 bg-[#1F2937]'}`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {imagePreview ? (
                                                <div className="relative w-full h-32 rounded-md overflow-hidden">
                                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="py-6 flex flex-col items-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-500 mb-2" />
                                                    <span className="text-sm text-gray-400">Clic para subir imagen (JPEG/PNG)</span>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-6 mt-4"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Guardando en Base y Storage...</>
                                        ) : (
                                            'Publicar Atracción'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna Derecha: Listado de Atracciones y Mapa */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Directorio Oficial</h2>
                            <Badge variant="outline" className="border-[#4F46E5] text-[#4F46E5] bg-[#4F46E5]/10">Mostrando {attractions.length} puntos</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {attractions.length === 0 ? (
                                <div className="col-span-full p-8 text-center border border-gray-800 border-dashed rounded-xl text-gray-500">
                                    No hay atracciones registradas aún.
                                </div>
                            ) : (
                                attractions.map(attr => (
                                    <Card key={attr.id} className="bg-[#111827] border-gray-800 overflow-hidden group">
                                        <div className="h-40 relative">
                                            {attr.image_url ? (
                                                <Image src={attr.image_url} alt={attr.name} fill className="object-cover transition-transform group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-gray-600" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-2">
                                                <Button size="icon" variant="destructive" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" onClick={() => handleDelete(attr.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-12">
                                                <Badge variant="outline" className="border-white/20 bg-black/40 text-white backdrop-blur-sm mb-1 font-mono">{attr.id}</Badge>
                                                <h3 className="font-bold text-white leading-tight">{attr.name}</h3>
                                            </div>
                                        </div>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-400 line-clamp-2 mb-4">{attr.description}</p>

                                            {/* Auto-generated QR Code Section */}
                                            <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col items-center">
                                                <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wider">QR Oficial para Impresión</p>
                                                <div className="bg-white p-2 rounded-xl mb-4 shadow-sm border-2 border-transparent hover:border-[#4F46E5] transition-colors relative group/qr">
                                                    <QRCodeSVG
                                                        id={`qr-code-${attr.id}`}
                                                        value={typeof window !== 'undefined' ? `${window.location.origin}/claim?lugar=${attr.id}` : `https://mypassport.com/claim?lugar=${attr.id}`}
                                                        size={140}
                                                        bgColor={"#ffffff"}
                                                        fgColor={"#0B0F19"}
                                                        level={"Q"}
                                                    />
                                                </div>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full bg-[#1F2937] hover:bg-[#374151] text-white border border-gray-700 font-medium tracking-wide flex items-center justify-center gap-2"
                                                    onClick={() => downloadQR(attr.id, attr.name)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Descargar QR (PNG)
                                                </Button>
                                                <p className="text-[10px] text-gray-500 font-mono select-all mt-3 text-center w-full bg-black/20 py-1 rounded">/claim?lugar={attr.id}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
