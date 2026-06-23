export interface GameDeck {
  id: string
  titulo: string
  descripcion: string
  esTurbio: boolean
  cartas: string[]
}

export const decks: GameDeck[] = [
  {
    id: 'dedo-en-la-llaga',
    titulo: 'El Dedo en la Llaga',
    descripcion: 'Quien es mas probable...',
    esTurbio: false,
    cartas: [
      'Tirarse un pedo en un ascensor lleno de gente',
      'Robar algo de un supermercado sin pagar',
      'Llegar borracho a una reunion familiar',
      'Enamorarse de su mejor amigo',
      'Quedarse dormido en el trabajo todos los dias',
      'Tener una cita con alguien que conocio en internet',
      'Gastar todo su sueldo en cosas inutiles',
      'Mentir en su curriculum para conseguir trabajo',
      'Bailar como si nadie lo estuviera mirando',
      'Cantarle una cancion de amor a un desconocido',
      'Ir a una fiesta y no conocer a nadie',
      'Perder el telefono en una discoteca',
      'Hacerle una broma pesada a su mejor amigo',
      'Decir "te quiero" en la primera cita',
      'Comprar algo por impulso y arrepentirse',
      'Confesar un secreto inconfesable en publico',
      'Tener una noche de karaoke y olvidar la letra',
      'Invitar a cenar a alguien que acaba de conocer',
      'Hacerse un tatuaje sin pensarlo dos veces',
      'Olvidar el cumpleanos de su pareja',
      'Pasar la noche entera hablando con un desconocido',
      'Llorar viendo una pelicula animada',
      'Comer algo que cayo al piso por no desperdiciarlo',
      'Mandar un mensaje borracho a su ex',
      'Gritar en medio de una biblioteca por accidente',
    ],
  },
  {
    id: 'yo-nunca',
    titulo: 'Yo Nunca',
    descripcion: 'Confiesa tus pecados mas oscuros',
    esTurbio: true,
    cartas: [
      'He besado a alguien en un bano de discoteca',
      'He fingido un orgasmo para terminar rapido',
      'He espiado a alguien por redes sociales durante horas',
      'He tenido un sueno erotico con un companero de trabajo',
      'He hecho videos intimos con alguien',
      'He tenido sexo en un lugar publico',
      'He usado una excusa falsa para terminar una relacion',
      'He visto porno en el trabajo o la escuela',
      'He compartido pantalla y tenido algo comprometedor abierto',
      'He tenido sexo con alguien que acabe de conocer',
      'He buscado a un ex en redes sociales estando en otra relacion',
      'He robado algo de la casa de un amigo',
      'He fingido estar enfermo para evitar una cita',
      'He hecho trampa en un juego de mesa',
      'He dicho un secreto de un amigo a otra persona',
      'He tenido relaciones con mas de una persona en el mismo dia',
      'He copiado en un examen importante',
      'He usado el telefono de alguien sin permiso',
      'He culpado a alguien mas por algo que hice yo',
      'He ghosteado a alguien sin ninguna explicacion',
      'He tenido sexo en la casa de mis padres',
      'He visto el historial del navegador de alguien mas',
      'He besado a alguien solo para dar celos a otro',
      'He entrado a una habitacion prohibida en una fiesta',
      'He fingido no recordar el nombre de alguien por verguenza',
    ],
  },
]

export function getDeckById(id: string): GameDeck | undefined {
  return decks.find((d) => d.id === id)
}
