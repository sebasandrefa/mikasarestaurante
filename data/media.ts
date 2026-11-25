import type { Localized } from "@/lib/i18n";

/**
 * Manifesto de mídia.
 *
 * Enquanto `available` for `false`, o site mostra um placeholder
 * claramente identificado (nunca uma foto falsa como se fosse oficial).
 *
 * Para publicar o material oficial:
 *   1. coloque o arquivo em /public/media/<arquivo>
 *      (vídeos pesados: use CDN / Vercel Blob e coloque a URL em `src`)
 *   2. mude `available` para `true`
 * Nenhum componente precisa ser alterado.
 */

export type MediaAsset = {
  id: string;
  kind: "image" | "video";
  src: string;
  /** Versão WebM opcional do vídeo. */
  webm?: string;
  /** Poster (imagem) do vídeo. Também usado como fallback. */
  poster?: string;
  width: number;
  height: number;
  alt: Localized;
  available: boolean;
};

const m = (asset: Omit<MediaAsset, "available"> & { available?: boolean }): MediaAsset => ({
  available: false,
  ...asset,
});

/** Fotos oficiais enviadas pelo restaurante (tratadas: cor, contraste, nitidez, vinheta). */
const photo = (id: string, width: number, height: number, alt: Localized): MediaAsset =>
  m({ id, kind: "image", src: `/media/${id}.webp`, width, height, alt, available: true });

export const photos = {
  hamachiRollNigiri: photo("hamachi-roll-nigiri", 1400, 1967, {
    es: "Roll y nigiri de hamachi flameado sobre hoja de plátano",
    en: "Seared hamachi roll and nigiri on a banana leaf",
  }),
  lomoSaltadoCausa: photo("lomo-saltado-causa", 1400, 1741, {
    es: "Lomo saltado con causa limeña y salsa criolla",
    en: "Lomo saltado with causa limeña and criolla salad",
  }),
  arrozCamaron: photo("arroz-camaron", 1400, 1391, {
    es: "Arroz salteado con camarones y huevo pochado en sartén de hierro",
    en: "Fried rice with shrimp and a poached egg in a cast-iron pan",
  }),
  nigiriExperience: photo("nigiri-experience", 1400, 938, {
    es: "Selección de ocho nigiri alrededor de salsa de soya",
    en: "Selection of eight nigiri around soy sauce",
  }),
  duckRice: photo("duck-rice", 1400, 2030, {
    es: "Arroz Nikkei con pato asado en sartén de hierro",
    en: "Nikkei rice with roasted duck in a cast-iron pan",
  }),
  salmonRoll: photo("salmon-roll", 1400, 2063, {
    es: "Roll de salmón flameado con salsa sobre mármol",
    en: "Seared salmon roll with sauce on marble",
  }),
  artesanoDessert: photo("artesano-dessert", 1400, 2091, {
    es: "Wontons crocantes con helado y chocolate",
    en: "Crispy wontons with ice cream and chocolate",
  }),
  sashimiSelection: photo("sashimi-selection", 1400, 2023, {
    es: "Selección de sashimi de atún y salmón sobre hielo",
    en: "Tuna and salmon sashimi selection on ice",
  }),
  nagasakiBeefRice: photo("nagasaki-beef-rice", 1400, 2058, {
    es: "Carne glaseada sobre arroz salteado al wok",
    en: "Glazed beef over wok-fried rice",
  }),
  mitokoTataki: photo("mitoko-tataki", 1400, 2091, {
    es: "Tataki de atún sellado con salsa y naranja",
    en: "Seared tuna tataki with sauce and orange",
  }),
  wakameKukuSalad: photo("wakame-kuku-salad", 1400, 2053, {
    es: "Ensalada de wakame, mango, pepino y aguacate",
    en: "Wakame, mango, cucumber and avocado salad",
  }),
  nigiriWine: photo("nigiri-wine", 1400, 2086, {
    es: "Nigiri variados con una copa de vino tinto",
    en: "Assorted nigiri with a glass of red wine",
  }),
  // Do Instagram @mikasa.restaurant (recortadas da publicação e tratadas)
  tiradito: photo("tiradito", 1400, 1750, {
    es: "Tiradito de pescado blanco con salsa amarilla, ají y crocante",
    en: "White fish tiradito with yellow sauce, chili and crispy garnish",
  }),
  robataSteak: photo("robata-steak", 1400, 1601, {
    es: "Corte de res a la parrilla en láminas con ensalada, vegetales y puré",
    en: "Sliced grilled beef with salad, vegetables and purée",
  }),
  barWhisky: photo("bar-whisky-kamiki", 1400, 2058, {
    es: "Whisky japonés Kamiki Blended Malt con su estuche",
    en: "Kamiki Japanese blended malt whisky with its box",
  }),
  barVinos: photo("bar-vinos", 1400, 2172, {
    es: "Botellas de vino Ramón Bilbao y Minuty Côtes de Provence en la terraza de MIKASA",
    en: "Ramón Bilbao and Minuty Côtes de Provence wine bottles on the MIKASA terrace",
  }),
  barHatsu: photo("bar-hatsu-tea", 1400, 2249, {
    es: "Botellas de Hatsu tea frente a la entrada de MIKASA",
    en: "Hatsu tea bottles in front of the MIKASA entrance",
  }),
  mochiIceCream: photo("mochi-ice-cream", 1400, 1750, {
    es: "Mochi con helado de la casa servido en sartén negra",
    en: "Mochi with house-made ice cream served in a black pan",
  }),
  spicyTunaSavageRoll: photo("spicy-tuna-savage-roll", 1400, 1750, {
    es: "Spicy Tuna Savage Roll con atún picante sobre bandeja de pizarra",
    en: "Spicy Tuna Savage Roll topped with spicy tuna on a slate tray",
  }),
  generalTso: photo("general-tso", 1400, 1750, {
    es: "General Tso con ajonjolí sobre arroz, servido en sartén de hierro",
    en: "General Tso with sesame over rice, served in a cast-iron pan",
  }),
  nigiriAtun: photo("nigiri-atun", 1400, 1750, {
    es: "Cuatro nigiri de atún con hoja de shiso y salsa de soya",
    en: "Four tuna nigiri with a shiso leaf and soy sauce",
  }),
  // Enviadas pelo restaurante em 25/11/2026 (ampliadas 4x com Real-ESRGAN; recorte sem as faixas do celular)
  gyozaVapor: photo("gyoza-vapor", 1400, 1867, {
    es: "Gyozas al vapor con cebollín y ajonjolí, con salsa de soya",
    en: "Steamed gyoza with scallions and sesame, with soy sauce",
  }),
  rollsCuchara: photo("rolls-cuchara", 1400, 1400, {
    es: "Rolls flameados con aguacate servidos en cucharas de porcelana sobre pizarra",
    en: "Seared rolls with avocado served on porcelain spoons over slate",
  }),
} satisfies Record<string, MediaAsset>;

export const media = {
  heroLoop: m({
    id: "hero-loop",
    kind: "video",
    src: "/media/hero-loop.mp4",
    webm: "/media/hero-loop.webm",
    poster: "/media/hero-poster.jpg",
    width: 1920,
    height: 1080,
    alt: {
      es: "Chef sellando un nigiri con soplete en la barra de MIKASA",
      en: "Chef torching a nigiri at the MIKASA counter",
    },
  }),
  heroPoster: m({
    id: "hero-poster",
    kind: "image",
    src: "/media/hero-poster.jpg",
    width: 1920,
    height: 1080,
    alt: { es: "Barra de MIKASA a media luz", en: "The MIKASA counter in low light" },
  }),
  philosophy: photos.nigiriWine,
  // Sem foto específica do Omakase Bluefin: usa a seleção de sashimi (atún) como representativa.
  omakase01: photos.sashimiSelection,
  omakase02: photos.nigiriExperience,
  omakase03: photos.hamachiRollNigiri,
  // Foto escolhida pelo restaurante para o card do Wagyu Tiradito
  omakase04: photos.tiradito,
  // Foto escolhida pelo restaurante para a seção Robata
  robata01: photos.robataSteak,
  bar01: photos.barWhisky,
  bar02: photos.barVinos,
  bar03: photos.barHatsu,
} satisfies Record<string, MediaAsset>;

/** Vídeo de cena: toca sozinho em câmera lenta, ida e volta, só com a cena na tela. */
export type SceneVideo = {
  /** paisagem 1280×720 (telas largas) */
  src: string;
  /** recorte retrato 540×720 para celular — mesma nitidez no que aparece, arquivo menor */
  mobile: string;
  poster: string;
  /** enquadramento no corte (CSS object-position), ex.: "50% 62%" */
  position: string;
  generatedByAI: boolean;
};

/**
 * Cena "A brasa acorda" (Robata): wagyu na brasa. ATENÇÃO: vídeo GERADO POR IA (enviado pelo
 * cliente) — é só clima, não é a grelha do MIKASA; não usar legenda que diga o contrário.
 * Fonte 1280×720 a 24 fps → câmera lenta 1.5x interpolada a 30 fps + ida e volta no mesmo arquivo:
 * `ffmpeg -i v.mp4 -vf "setpts=1.5*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" lento.mp4`
 * `ffmpeg -i lento.mp4 -filter_complex "[0:v]split[a][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1,format=yuv420p" -an -c:v libx264 -profile:v high -level:v 4.0 -preset slow -crf 20 -tune film -x264-params ref=4:keyint=60 -movflags +faststart fogo.mp4`
 * (nível 4.0 e poucos quadros de referência: o iPhone não toca nível 5 em 720p de forma confiável)
 * Celular: o mesmo, com `crop=540:720:X:0` antes do setpts, X = posição horizontal × 740
 * (assim o enquadramento no celular fica igual ao do corte do vídeo largo).
 * Nome com hash do conteúdo: /media é cache "immutable" de 1 ano — arquivo novo = nome novo.
 * Substituir por um vídeo real do restaurante quando houver (de preferência 1080p ou 4K).
 */
export const robataFire: SceneVideo = {
  src: "/media/robata-fogo/fogo-81d2d61f.mp4",
  mobile: "/media/robata-fogo/fogo-m-402b0e70.mp4",
  poster: "/media/robata-fogo/poster.webp",
  position: "50% 62%",
  generatedByAI: true,
};

/**
 * Entrada do Bar: whisky servido sobre a esfera de gelo. ATENÇÃO: vídeo GERADO POR IA (enviado
 * pelo cliente) — só clima; não é o bar do MIKASA. Mesmo preparo do robataFire.
 */
export const barPour: SceneVideo = {
  src: "/media/bar-whisky-pour/whisky-921fb8f2.mp4",
  mobile: "/media/bar-whisky-pour/whisky-m-6a888ddb.mp4",
  poster: "/media/bar-whisky-pour/poster.webp",
  position: "43% 70%",
  generatedByAI: true,
};

/**
 * O lugar — quadros do vídeo real da terraza enviado pelo restaurante (480p, ampliados 4x com
 * Real-ESRGAN realesr-general-x4v3; ver `placeVideo`). Trocar pelo original em alta quando chegar.
 */
const place = (id: string, alt: Localized): MediaAsset => photo(id, 1600, 894, alt);
export const placePhotos = {
  terraza: place("lugar-terraza", {
    es: "Terraza de MIKASA al anochecer, con mesas vestidas de blanco y luces en el jardín",
    en: "MIKASA's terrace at dusk, with white-clothed tables and garden lights",
  }),
  mesa: place("lugar-mesa", {
    es: "Mesa en la terraza con sillas rojas y vista al jardín",
    en: "Terrace table with red chairs overlooking the garden",
  }),
  letrero: place("lugar-letrero", {
    es: "Letrero MIKASA ミカサ en la pared de la terraza",
    en: "MIKASA ミカサ sign on the terrace wall",
  }),
  terrazaLuces: place("lugar-terraza-luces", {
    es: "Mesas de la terraza junto a la entrada, con apliques encendidos",
    en: "Terrace tables by the entrance, with wall lights on",
  }),
  terrazaLetrero: place("lugar-terraza-letrero", {
    es: "Terraza con lámparas de pie y el letrero de MIKASA al fondo",
    en: "Terrace with floor lamps and the MIKASA sign in the background",
  }),
  palmera: place("lugar-palmera", {
    es: "Palmera y mesas en la terraza de MIKASA",
    en: "Palm tree and tables on MIKASA's terrace",
  }),
};

/**
 * Cena "El lugar": vídeo REAL da terraza (não é IA). Trechos 7–11 s, 16–21 s, 31–37,5 s e 52,3–56,4 s
 * do vídeo enviado, estabilizados (vidstab), unidos com fusões, câmera lenta 0,8x interpolada,
 * ampliados 4x (Real-ESRGAN) e com fade nas pontas para o loop. Celular: recorte retrato.
 */
export const placeVideo: SceneVideo = {
  src: "/media/lugar/lugar-c83721bb.mp4",
  mobile: "/media/lugar/lugar-m-d13c1d6e.mp4",
  poster: "/media/lugar/poster.webp",
  position: "50% 50%",
  generatedByAI: false,
};

/**
 * O lugar por dentro — fotos REAIS do salão enviadas pelo restaurante (WhatsApp 1200×1600),
 * ampliadas 4x com Real-ESRGAN, reduzidas para 1500×2000 e com tratamento leve (cor mais quente,
 * brancos contidos, vinheta) para o site escuro. Nada adicionado nem removido das cenas.
 */
const room = (id: string, width: number, height: number, alt: Localized): MediaAsset => photo(id, width, height, alt);
export const roomPhotos = {
  puerta: room("sala-puerta", 1500, 2000, {
    es: "Sala de MIKASA con la puerta roja, el mural de cerezos y mesas listas para la cena",
    en: "MIKASA's dining room with the red door, the cherry-blossom mural and tables set for dinner",
  }),
  sala: room("sala-lampara", 1500, 2000, {
    es: "Mesa servida frente a la vitrina y la lámpara roja de la sala",
    en: "A table set in front of the display case and the red pendant lamp",
  }),
  mesas: room("sala-mesas", 2000, 1500, {
    es: "Mesas con manteles blancos, sillas rojas y negras, cortinas y caligrafía japonesa en la pared",
    en: "Tables with white cloths, red and black chairs, curtains and Japanese calligraphy on the wall",
  }),
  barra: room("sala-barra", 1500, 2000, {
    es: "Barra con botellas de gin Hendrick's y el reconocimiento Restaurant Guru 2023",
    en: "Bar with Hendrick's gin bottles and the Restaurant Guru 2023 recognition",
  }),
  vitrina: room("sala-vitrina", 1500, 2000, {
    es: "Vitrina iluminada sobre la cava de vinos, junto al diploma «Best Sushi» de Restaurant Guru 2023",
    en: "Lit display case above the wine cooler, next to the Restaurant Guru 2023 “Best Sushi” award",
  }),
};

/**
 * Cena "Pase adelante": vídeo REAL do salão (não é IA). Trechos 0–4,4 s (porta com o letreiro),
 * 5–8 s (mesas), 1:31,5–1:36,5 (vitrine) e 1:42,3–1:45,8 (porta vermelha para a terraza),
 * estabilizados (vidstab), unidos com fusões, câmera lenta 0,6x (fonte 60 fps), ampliados 4x
 * (Real-ESRGAN) e com cor mais quente e brancos contidos. Celular: recorte retrato.
 */
export const roomVideo: SceneVideo = {
  src: "/media/sala/sala-124e6508.mp4",
  mobile: "/media/sala/sala-m-b203cd96.mp4",
  poster: "/media/sala/poster.webp",
  position: "50% 50%",
  generatedByAI: false,
};

/** Vídeo REAL (vertical) da terraza cheia à noite: trechos 0–3,5 s e 17,6–21,4 s, estabilizados, 0,75x, ampliados. */
export const terraceNights: SceneVideo = {
  src: "/media/sala/noches-01c5c871.mp4",
  mobile: "/media/sala/noches-01c5c871.mp4",
  poster: "/media/sala/noches-poster.webp",
  position: "50% 50%",
  generatedByAI: false,
};

export type GalleryItem = {
  asset: MediaAsset;
  category: "platos" | "sushi" | "robata" | "bebidas" | "ambiente" | "detalles" | "chef" | "fuego" | "postres";
  ratio: "portrait" | "landscape" | "square";
};

const gi = (asset: MediaAsset, category: GalleryItem["category"], ratio: GalleryItem["ratio"]): GalleryItem => ({ asset, category, ratio });

/** Galeria editorial — fotos oficiais. Ambiente: fotos reais do salão e quadros do vídeo real da terraza. Chef, bar e fogo: aguardando material. */
export const gallery: GalleryItem[] = [
  gi(photos.sashimiSelection, "sushi", "portrait"),
  gi(roomPhotos.puerta, "ambiente", "portrait"),
  gi(photos.lomoSaltadoCausa, "platos", "portrait"),
  gi(photos.artesanoDessert, "postres", "portrait"),
  gi(placePhotos.terrazaLuces, "ambiente", "landscape"),
  gi(photos.nigiriExperience, "sushi", "landscape"),
  gi(photos.mitokoTataki, "detalles", "portrait"),
  gi(roomPhotos.sala, "ambiente", "portrait"),
  gi(photos.arrozCamaron, "platos", "square"),
  gi(photos.rollsCuchara, "sushi", "square"),
  gi(photos.wakameKukuSalad, "platos", "portrait"),
  gi(roomPhotos.barra, "ambiente", "portrait"),
  gi(photos.nigiriWine, "sushi", "portrait"),
  gi(placePhotos.terrazaLetrero, "ambiente", "landscape"),
  gi(photos.duckRice, "platos", "portrait"),
  gi(roomPhotos.mesas, "ambiente", "landscape"),
  gi(photos.salmonRoll, "sushi", "portrait"),
  gi(photos.gyozaVapor, "platos", "portrait"),
  gi(photos.nagasakiBeefRice, "platos", "portrait"),
  gi(roomPhotos.vitrina, "ambiente", "portrait"),
  gi(photos.hamachiRollNigiri, "sushi", "portrait"),
  gi(placePhotos.palmera, "ambiente", "landscape"),
];
