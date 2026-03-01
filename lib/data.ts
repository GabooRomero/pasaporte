export interface Attraction {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

export const ATTRACTIONS: Attraction[] = [
    {
        id: "glaciar",
        name: "Glaciar Perito Moreno",
        description: "Una de las maravillas naturales más impactantes de Argentina, ubicada en el Parque Nacional Los Glaciares.",
        imageUrl: "https://images.unsplash.com/photo-1517232828383-0599c9c3817f?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "cataratas",
        name: "Cataratas del Iguazú",
        description: "El sistema de cascadas más grande del mundo, una fuerza de la naturaleza en la selva misionera.",
        imageUrl: "https://images.unsplash.com/photo-1522606822283-e02fb4b8d781?auto=format&fit=crop&w=800&q=80"
    },
    {
        id: "obelisco",
        name: "Obelisco de Buenos Aires",
        description: "El histórico monumento ícono de Buenos Aires, ubicado en el corazón de la Avenida 9 de Julio.",
        imageUrl: "https://images.unsplash.com/photo-1612294037637-ec328d0e075e?auto=format&fit=crop&w=800&q=80"
    }
];

export function getAttractionById(id: string | null): Attraction | undefined {
    if (!id) return undefined;
    return ATTRACTIONS.find(attr => attr.id.toLowerCase() === id.toLowerCase());
}
