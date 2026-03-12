export type Language = "en" | "es";

export const translations = {
  // ── Menu ──
  menuInvite: {
    en: "Invite you to their Wedding!",
    es: "¡Les invitan a su Boda!",
  },
  menuDate: {
    en: "26-27 September 2026",
    es: "26-27 Septiembre 2026",
  },
  menuStart: { en: "Play", es: "Jugar" },
  menuSchedule: { en: "Schedule", es: "Programa" },
  menuTravelStay: { en: "Travel & Stay", es: "Viaje y Alojamiento" },
  menuRsvp: { en: "RSVP", es: "Confirmar" },
  menuInfo: { en: "Info", es: "Info" },
  menuGallery: { en: "Gallery", es: "Galería" },
  menuFooter: {
    en: "Use arrows + enter or tap",
    es: "Usa flechas + enter o toca",
  },

  // ── MenuItem ──
  locked: { en: "[LOCKED]", es: "[BLOQUEADO]" },

  // ── Instructions ──
  howToPlay: { en: "HOW TO PLAY", es: "CÓMO JUGAR" },
  helpLukeReach: {
    en: "Help Luke reach",
    es: "Ayuda a Luke a llegar a",
  },
  villaBettoni: { en: "Villa Bettoni!", es: "¡Villa Bettoni!" },
  spaceUpJump: {
    en: "SPACE / UP = Jump",
    es: "ESPACIO / ARRIBA = Saltar",
  },
  tapJumpMobile: {
    en: "Tap = Jump (mobile)",
    es: "Toca = Saltar (móvil)",
  },
  pressSpaceOrTap: {
    en: "Press SPACE or tap to start!",
    es: "¡Pulsa ESPACIO o toca para empezar!",
  },

  // ── Game Submenu ──
  start: { en: "Start", es: "Iniciar" },

  // ── Game Result ──
  youMadeIt: { en: "YOU MADE IT!", es: "¡LO LOGRASTE!" },
  gameOver: { en: "GAME OVER", es: "FIN DEL JUEGO" },
  tryAgain: { en: "Try Again", es: "Intentar de Nuevo" },
  competeHighScore: {
    en: "Compete for the High Score",
    es: "Compite por el Puntaje Más Alto",
  },
  endless: { en: "Endless", es: "Sin Fin" },
  endlessGameOver: { en: "ENDLESS RUN OVER", es: "FIN DE LA CARRERA" },
  lukeReachedVilla: {
    en: "Luke reached Villa Bettoni!",
    es: "¡Luke llegó a Villa Bettoni!",
  },
  lukeProgress: {
    en: "Luke made it {pct}% of the way to Villa Bettoni!",
    es: "¡Luke recorrió el {pct}% del camino a Villa Bettoni!",
  },
  avoidBallsHint: {
    en: "Tip: Avoid the soccer balls!",
    es: "¡Consejo: Evita los balones!",
  },
  score: { en: "Score", es: "Puntos" },
  retry: { en: "Retry", es: "Reintentar" },
  menu: { en: "Menu", es: "Menú" },

  // ── Panel ──
  back: { en: "< BACK", es: "< VOLVER" },

  // ── Panel titles (page.tsx) ──
  panelSchedule: { en: "Schedule", es: "Programa" },
  panelTravelStay: { en: "Travel & Stay", es: "Viaje y Alojamiento" },
  panelRsvp: { en: "RSVP", es: "Confirmar" },
  panelInfo: { en: "Info", es: "Info" },
  panelGallery: { en: "Gallery", es: "Galería" },

  // ── Schedule ──
  saturdayTitle: {
    en: "SATURDAY 26TH SEPTEMBER",
    es: "SÁBADO 26 DE SEPTIEMBRE",
  },
  sundayTitle: {
    en: "SUNDAY 27TH SEPTEMBER",
    es: "DOMINGO 27 DE SEPTIEMBRE",
  },
  eveningGathering: {
    en: "WELCOME APERITIVO",
    es: "APERITIVO DE BIENVENIDA",
  },
  eveningGatheringDetails: {
    en: "6:00 PM - 9:00 PM @ Our home (TBD)",
    es: "6:00 PM - 9:00 PM @ Nuestra casa (TBD)",
  },
  eveningGatheringDesc: {
    en: "Charcuterie board, pizzas & drinks",
    es: "Tabla de embutidos, pizzas y bebidas",
  },
  ceremony: { en: "CEREMONY", es: "CEREMONIA" },
  ceremonyDetails: {
    en: "~2:00 PM @ Our home",
    es: "~2:00 PM @ Nuestra casa",
  },
  dinnerAndParty: {
    en: "RECEPTION",
    es: "RECEPCIÓN",
  },
  dinnerAndPartyDetails: {
    en: "3:00 PM - Midnight @ Villa Bettoni",
    es: "3:00 PM - Medianoche @ Villa Bettoni",
  },
  moreInfoToCome: {
    en: "More info to come",
    es: "Más información próximamente",
  },

  // ── Travel ──
  gettingThere: { en: "GETTING THERE", es: "CÓMO LLEGAR" },
  travelNearestAirports: {
    en: "Nearest airports are Il Caravaggio International Airport in Bergamo and Valerio Catullo Airport in Verona. They are ~2.5 hours by train and ~1 hour by car.",
    es: "Los aeropuertos más cercanos son el Aeropuerto Internacional Il Caravaggio en Bérgamo y el Aeropuerto Valerio Catullo en Verona. Están a ~2.5 horas en tren y ~1 hora en carro.",
  },
  travelMilanAirports: {
    en: "The other two airports in Milan are also possible but further away.",
    es: "Los otros dos aeropuertos de Milán también son una opción, pero están más lejos.",
  },
  whereToStay: { en: "WHERE TO STAY", es: "DÓNDE ALOJARSE" },
  accommodationSoon: {
    en: "Accommodation details coming soon",
    es: "Detalles de alojamiento próximamente",
  },
  gettingAround: { en: "GETTING AROUND", es: "MOVERSE POR LA ZONA" },
  gettingAroundCar: {
    en: "Renting a car is recommended. If not from the EU, you will need an International Driving Permit. Rental companies usually only accept credit card.",
    es: "Se recomienda alquilar un coche. Si no eres de la UE, necesitarás un Permiso Internacional de Conducir. Las empresas de alquiler generalmente solo aceptan tarjeta de crédito.",
  },
  gettingAroundShuttle: {
    en: "A shuttle will run between the main hotels and the venues.",
    es: "Habrá un servicio de traslado entre los hoteles principales y los lugares del evento.",
  },

  // ── Info ──
  venue: { en: "VENUE", es: "LUGAR" },
  venueIsa: {
    en: "Villa Isa - Via della Seriola 15, Salo, Italy",
    es: "Villa Isa - Via della Seriola 15, Salo, Italia",
  },
  venueBettoni: {
    en: "Villa Bettoni - Via della Liberta, Gargnano, Italy",
    es: "Villa Bettoni - Via della Liberta, Gargnano, Italia",
  },
  detailsSoon: {
    en: "Details coming soon",
    es: "Detalles próximamente",
  },
  shuttleTimetable: { en: "SHUTTLE TIMETABLE", es: "HORARIO DE TRASLADO" },
  shuttleTimetableSoon: {
    en: "Times to be confirmed",
    es: "Horarios por confirmar",
  },
  dressCode: { en: "DRESS CODE", es: "CÓDIGO DE VESTIMENTA" },
  dressCodeAperitivoTitle: { en: "Aperitivo Night", es: "Noche de Aperitivo" },
  dressCodeAperitivoDesc: {
    en: "Italian casual. Come comfortable and relaxed — dresses, shirts, trousers, or similar. Evenings by the lake can be cool, so bringing a light layer is a good idea.",
    es: "Casual italiano. Ven cómodo y relajado — vestidos, camisas, pantalones o similar. Las noches junto al lago pueden ser frescas, así que una capa ligera es buena idea.",
  },
  dressCodeWeddingTitle: { en: "Wedding Day", es: "Día de la Boda" },
  dressCodeWeddingDesc: {
    en: "Formal, but most importantly comfortable. Wear whatever makes you feel good celebrating with us. Layers for the evening are recommended.",
    es: "Formal, pero sobre todo cómodo. Viste lo que te haga sentir bien celebrando con nosotros. Se recomiendan capas para la noche.",
  },
  gifts: { en: "GIFTS", es: "REGALOS" },
  stillHaveQuestions: {
    en: "Still have questions?",
    es: "¿Tienes preguntas?",
  },
  feelFreeReachOut: {
    en: "Feel free to reach out to us",
    es: "No dudes en contactarnos",
  },

  // ── Gallery ──
  galleryLocked: { en: "[LOCKED]", es: "[BLOQUEADO]" },
  comingSoonAfter: {
    en: "Coming soon after",
    es: "Disponible después de",
  },
  theBigDay: { en: "the big day!", es: "¡el gran día!" },
  weddingPhotosHere: {
    en: "Wedding photos will appear here",
    es: "Las fotos de la boda aparecerán aquí",
  },
  photo: { en: "PHOTO", es: "FOTO" },

  // ── RSVP ──
  rsvpJoiningUs: {
    en: "will you be joining us?",
    es: "¿nos acompañarás?",
  },
  rsvpReceived: { en: "RSVP RECEIVED!", es: "¡CONFIRMACIÓN RECIBIDA!" },
  seeYouAt: { en: "See you at", es: "Nos vemos en" },
  wellMissYou: {
    en: "We\u2019ll miss you!",
    es: "¡Te extrañaremos!",
  },
  submitAnother: { en: "Submit another", es: "Enviar otra" },
  rsvpUseInviteLink: {
    en: "Please use your invite link to RSVP",
    es: "Usa tu enlace de invitación para confirmar",
  },
  rsvpByPrefix: { en: "by", es: "antes del" },
  guestAttending: { en: "ATTENDING?", es: "¿ASISTE?" },
  rsvpSubmitting: { en: "SENDING...", es: "ENVIANDO..." },
  rsvpError: {
    en: "Something went wrong. Please try again.",
    es: "Algo salió mal. Intenta de nuevo.",
  },
  invalidInviteCode: {
    en: "Invalid invite link",
    es: "Enlace de invitación no válido",
  },
  invalidInviteDesc: {
    en: "This invite link is not recognized. Please check your link and try again.",
    es: "Este enlace de invitación no es reconocido. Revisa tu enlace e intenta de nuevo.",
  },
  email: { en: "CONTACT EMAIL *", es: "CORREO DE CONTACTO *" },
  emailPlaceholder: { en: "your@email.com", es: "tu@correo.com" },
  yes: { en: "YES", es: "SÍ" },
  no: { en: "NO", es: "NO" },
  dietaryRequirements: {
    en: "DIETARY REQUIREMENTS",
    es: "REQUISITOS DIETÉTICOS",
  },
  dietaryPlaceholder: {
    en: "Any allergies or dietary needs?",
    es: "¿Alguna alergia o necesidad dietética?",
  },
  songRequest: { en: "SONG REQUEST", es: "CANCIÓN SOLICITADA" },
  songPlaceholder: {
    en: "What gets you on the dance floor?",
    es: "¿Qué te saca a bailar?",
  },
  additionalInfo: {
    en: "ADDITIONAL INFO",
    es: "INFORMACIÓN ADICIONAL",
  },
  additionalInfoHint: {
    en: "Dietary Requirements, Arrival and Departure Times etc.",
    es: "Requisitos dietéticos, horarios de llegada y salida, etc.",
  },
  optionalMessage: {
    en: "Optional message...",
    es: "Mensaje opcional...",
  },
  sendRsvp: { en: "SEND RSVP", es: "ENVIAR CONFIRMACIÓN" },

  // ── Hotel offer ──
  hotelOfferTitle: { en: "HOTEL", es: "HOTEL" },
  hotelOfferMessage: {
    en: "We appreciate the commitment of coming to our big day and would like to offer you 2 nights at Hotel Spiaggia d\u2019Oro during the wedding. Do you accept?",
    es: "Apreciamos el compromiso de venir a nuestro gran día y nos gustaría ofrecerte 2 noches en el Hotel Spiaggia d\u2019Oro durante la boda. ¿Aceptas?",
  },
  hotelAccepted: { en: "Hotel accepted!", es: "¡Hotel aceptado!" },
  hotelDeclined: { en: "Hotel declined.", es: "Hotel rechazado." },
  hotelSaving: { en: "SAVING...", es: "GUARDANDO..." },
  hotelSave: { en: "SAVE", es: "GUARDAR" },

  // ── Leaderboard ──
  menuLeaderboard: { en: "Leaderboard", es: "Tabla de Posiciones" },
  panelLeaderboard: { en: "Leaderboard", es: "Tabla de Posiciones" },
  leaderboardRank: { en: "#", es: "#" },
  leaderboardName: { en: "NAME", es: "NOMBRE" },
  leaderboardScore: { en: "SCORE", es: "PUNTOS" },
  leaderboardEmpty: {
    en: "No scores yet. Be the first!",
    es: "Sin puntos aún. ¡Sé el primero!",
  },
  leaderboardLoading: { en: "Loading...", es: "Cargando..." },
  leaderboardError: {
    en: "Could not load leaderboard",
    es: "No se pudo cargar la tabla.",
  },
  leaderboardYou: { en: "(you)", es: "(tú)" },

  // ── Score Submitted ──
  scoreSubmitted: { en: "Score submitted!", es: "¡Puntos enviados!" },
} as const;

export type TranslationKey = keyof typeof translations;
