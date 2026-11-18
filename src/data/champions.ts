import rawChampionsTr from './champions-tr.json';

export type Lane = 'top' | 'jungle' | 'mid' | 'adc' | 'support';
export type ChampionTag = 'Fighter' | 'Mage' | 'Assassin' | 'Tank' | 'Marksman' | 'Support';
export type RegionId =
  | 'ixtal'
  | 'demacia'
  | 'noxus'
  | 'ionia'
  | 'freljord'
  | 'piltover'
  | 'zaun'
  | 'shurima'
  | 'targon'
  | 'shadowisles'
  | 'bilgewater'
  | 'void'
  | 'bandle'
  | 'runeterra';

export interface RegionMeta {
  id: RegionId;
  name: string;
  subtitle: string;
  color: string;
}

export interface ChampionInfo {
  attack: number;
  defense: number;
  magic: number;
  difficulty: number;
}

export interface Champion {
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  tags: ChampionTag[];
  partype: string;
  info: ChampionInfo;
  lanes: Lane[];
  region: RegionId;
  quote: string;
  version: string;
}

export interface ChampionSkin {
  id: number;
  name: string;
  isBase: boolean;
  splashUrl: string;
}

export interface ChampionAbility {
  key: string;
  name: string;
  description: string;
  iconUrl: string;
}

export interface ChampionDetails {
  shortBio: string;
  primaryTag?: string;
  secondaryTag?: string;
  damageType?: string;
  playstyleInfo?: {
    damage: number;
    durability: number;
    crowdControl: number;
    mobility: number;
    utility: number;
  };
  skins: ChampionSkin[];
  abilities: ChampionAbility[];
  hasChooseVo: boolean;
  hasBanVo: boolean;
}

export interface YoutubeChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'KOLAY' | 'ORTA' | 'ZOR' | 'İMKÂNSIZ';
}

export const DDRAGON_VERSION = rawChampionsTr.version || '16.23.1';

export const REGIONS: RegionMeta[] = [
  { id: 'ixtal', name: 'Ixtal', subtitle: 'Elementlerin Ormanı', color: '#2ECC71' },
  { id: 'demacia', name: 'Demacia', subtitle: 'Adalet Krallığı', color: '#F1C40F' },
  { id: 'noxus', name: 'Noxus', subtitle: 'Kudret İmparatorluğu', color: '#E84057' },
  { id: 'ionia', name: 'Ionia', subtitle: 'İlk Diyarlar', color: '#EC4899' },
  { id: 'freljord', name: 'Freljord', subtitle: 'Sonsuz Buz Diyarı', color: '#38BDF8' },
  { id: 'piltover', name: 'Piltover', subtitle: 'Gelişim Şehri', color: '#EAB308' },
  { id: 'zaun', name: 'Zaun', subtitle: 'Yeraltı Şehri', color: '#10B981' },
  { id: 'shurima', name: 'Shurima', subtitle: 'Güneş İmparatorluğu', color: '#F59E0B' },
  { id: 'targon', name: 'Targon', subtitle: 'Semavi Zirve', color: '#818CF8' },
  { id: 'shadowisles', name: 'Gölge Adalar', subtitle: 'Karanlık Sis', color: '#14B8A6' },
  { id: 'bilgewater', name: 'Bilgewater', subtitle: 'Korsan Limanı', color: '#F97316' },
  { id: 'void', name: 'Hiçlik', subtitle: 'Karanlık Yırtık', color: '#A855F7' },
  { id: 'bandle', name: 'Bandle Şehri', subtitle: 'Yordle Diyarı', color: '#FB7185' },
  { id: 'runeterra', name: 'Runeterra', subtitle: 'Bağımsız Gezginler', color: '#C8AA6E' },
];

export const REGION_META: Record<RegionId, RegionMeta> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r])
) as Record<RegionId, RegionMeta>;

const CHAMPION_REGIONS: Record<string, RegionId> = {
  // IXTAL
  Malphite: 'ixtal',
  Milio: 'ixtal',
  Neeko: 'ixtal',
  Nidalee: 'ixtal',
  Qiyana: 'ixtal',
  Rengar: 'ixtal',
  Skarner: 'ixtal',
  Zyra: 'ixtal',

  // DEMACIA
  Fiora: 'demacia',
  Galio: 'demacia',
  Garen: 'demacia',
  JarvanIV: 'demacia',
  Kayle: 'demacia',
  Locke: 'demacia',
  Lucian: 'demacia',
  Lux: 'demacia',
  Morgana: 'demacia',
  Poppy: 'demacia',
  Quinn: 'demacia',
  Shyvana: 'demacia',
  Sona: 'demacia',
  Sylas: 'demacia',
  Vayne: 'demacia',
  XinZhao: 'demacia',

  // NOXUS
  Ambessa: 'noxus',
  Briar: 'noxus',
  Cassiopeia: 'noxus',
  Darius: 'noxus',
  Draven: 'noxus',
  Katarina: 'noxus',
  Kled: 'noxus',
  Leblanc: 'noxus',
  Mel: 'noxus',
  Mordekaiser: 'noxus',
  Rell: 'noxus',
  Riven: 'noxus',
  Samira: 'noxus',
  Sion: 'noxus',
  Swain: 'noxus',
  Talon: 'noxus',
  Vladimir: 'noxus',

  // IONIA
  Ahri: 'ionia',
  Akali: 'ionia',
  Hwei: 'ionia',
  Irelia: 'ionia',
  Ivern: 'ionia',
  Jhin: 'ionia',
  Karma: 'ionia',
  Kayn: 'ionia',
  Kennen: 'ionia',
  LeeSin: 'ionia',
  Lillia: 'ionia',
  MasterYi: 'ionia',
  MonkeyKing: 'ionia',
  Rakan: 'ionia',
  Sett: 'ionia',
  Shen: 'ionia',
  Syndra: 'ionia',
  Varus: 'ionia',
  Xayah: 'ionia',
  Yasuo: 'ionia',
  Yone: 'ionia',
  Yunara: 'ionia',
  Zed: 'ionia',

  // FRELJORD
  Anivia: 'freljord',
  Ashe: 'freljord',
  Aurora: 'freljord',
  Braum: 'freljord',
  Gnar: 'freljord',
  Gragas: 'freljord',
  Lissandra: 'freljord',
  Nunu: 'freljord',
  Olaf: 'freljord',
  Ornn: 'freljord',
  Sejuani: 'freljord',
  Trundle: 'freljord',
  Tryndamere: 'freljord',
  Udyr: 'freljord',
  Volibear: 'freljord',

  // PILTOVER
  Caitlyn: 'piltover',
  Camille: 'piltover',
  Ezreal: 'piltover',
  Heimerdinger: 'piltover',
  Jayce: 'piltover',
  Orianna: 'piltover',
  Seraphine: 'piltover',
  Vi: 'piltover',

  // ZAUN
  Blitzcrank: 'zaun',
  DrMundo: 'zaun',
  Ekko: 'zaun',
  Janna: 'zaun',
  Jinx: 'zaun',
  Renata: 'zaun',
  Singed: 'zaun',
  Twitch: 'zaun',
  Urgot: 'zaun',
  Viktor: 'zaun',
  Warwick: 'zaun',
  Zac: 'zaun',
  Zeri: 'zaun',
  Ziggs: 'zaun',

  // SHURIMA
  Akshan: 'shurima',
  Amumu: 'shurima',
  Azir: 'shurima',
  KSante: 'shurima',
  Naafiri: 'shurima',
  Nasus: 'shurima',
  Rammus: 'shurima',
  Renekton: 'shurima',
  Sivir: 'shurima',
  Taliyah: 'shurima',
  Xerath: 'shurima',

  // TARGON
  Aphelios: 'targon',
  AurelionSol: 'targon',
  Diana: 'targon',
  Leona: 'targon',
  Pantheon: 'targon',
  Soraka: 'targon',
  Taric: 'targon',
  Zoe: 'targon',

  // SHADOW ISLES (GÖLGE ADALAR)
  Elise: 'shadowisles',
  Gwen: 'shadowisles',
  Hecarim: 'shadowisles',
  Kalista: 'shadowisles',
  Karthus: 'shadowisles',
  Maokai: 'shadowisles',
  Senna: 'shadowisles',
  Thresh: 'shadowisles',
  Vex: 'shadowisles',
  Viego: 'shadowisles',
  Yorick: 'shadowisles',

  // BILGEWATER
  Fizz: 'bilgewater',
  Gangplank: 'bilgewater',
  Graves: 'bilgewater',
  Illaoi: 'bilgewater',
  MissFortune: 'bilgewater',
  Nautilus: 'bilgewater',
  Nilah: 'bilgewater',
  Pyke: 'bilgewater',
  TahmKench: 'bilgewater',
  TwistedFate: 'bilgewater',

  // VOID (HİÇLİK)
  Belveth: 'void',
  Chogath: 'void',
  Kaisa: 'void',
  Kassadin: 'void',
  Khazix: 'void',
  KogMaw: 'void',
  Malzahar: 'void',
  RekSai: 'void',
  Velkoz: 'void',

  // BANDLE CITY
  Corki: 'bandle',
  Lulu: 'bandle',
  Rumble: 'bandle',
  Teemo: 'bandle',
  Tristana: 'bandle',
  Veigar: 'bandle',
  Yuumi: 'bandle',

  // RUNETERRA (BAĞIMSIZ / GEZGİNLER)
  Aatrox: 'runeterra',
  Alistar: 'runeterra',
  Annie: 'runeterra',
  Bard: 'runeterra',
  Brand: 'runeterra',
  Evelynn: 'runeterra',
  Fiddlesticks: 'runeterra',
  Jax: 'runeterra',
  Kindred: 'runeterra',
  Nami: 'runeterra',
  Nocturne: 'runeterra',
  Ryze: 'runeterra',
  Shaco: 'runeterra',
  Smolder: 'runeterra',
  Zaahen: 'runeterra',
  Zilean: 'runeterra',
};

export const LANE_META: Record<Lane, { label: string; short: string; color: string }> = {
  top: { label: 'Üst Koridor', short: 'TOP', color: '#E84057' },
  jungle: { label: 'Orman', short: 'JGL', color: '#27AE60' },
  mid: { label: 'Orta Koridor', short: 'MID', color: '#0AC8B9' },
  adc: { label: 'Alt Koridor', short: 'ADC', color: '#F39C12' },
  support: { label: 'Destek', short: 'SUP', color: '#9B59B6' },
};

export const TAG_LABELS_TR: Record<ChampionTag, string> = {
  Fighter: 'Dövüşçü',
  Mage: 'Büyücü',
  Assassin: 'Suikastçı',
  Tank: 'Tank',
  Marksman: 'Nişancı',
  Support: 'Destek',
};

const CHAMPION_LANES: Record<string, Lane[]> = {
  Aatrox: ['top'],
  Ahri: ['mid'],
  Akali: ['mid', 'top'],
  Akshan: ['mid', 'top'],
  Alistar: ['support'],
  Ambessa: ['top', 'jungle'],
  Amumu: ['jungle', 'support'],
  Anivia: ['mid'],
  Annie: ['mid', 'support'],
  Aphelios: ['adc'],
  Ashe: ['adc', 'support'],
  AurelionSol: ['mid'],
  Aurora: ['mid', 'top'],
  Azir: ['mid'],
  Bard: ['support'],
  Belveth: ['jungle'],
  Blitzcrank: ['support'],
  Brand: ['support', 'jungle', 'mid'],
  Braum: ['support'],
  Briar: ['jungle'],
  Caitlyn: ['adc'],
  Camille: ['top', 'support'],
  Cassiopeia: ['mid', 'top'],
  Chogath: ['top', 'mid'],
  Corki: ['mid', 'adc'],
  Darius: ['top'],
  Diana: ['jungle', 'mid'],
  Draven: ['adc'],
  DrMundo: ['top', 'jungle'],
  Ekko: ['jungle', 'mid'],
  Elise: ['jungle', 'support'],
  Evelynn: ['jungle'],
  Ezreal: ['adc'],
  Fiddlesticks: ['jungle'],
  Fiora: ['top'],
  Fizz: ['mid'],
  Galio: ['mid', 'support'],
  Gangplank: ['top', 'mid'],
  Garen: ['top'],
  Gnar: ['top'],
  Gragas: ['jungle', 'top', 'mid'],
  Graves: ['jungle'],
  Gwen: ['top', 'jungle'],
  Hecarim: ['jungle'],
  Heimerdinger: ['top', 'support', 'mid'],
  Hwei: ['mid', 'support'],
  Illaoi: ['top'],
  Irelia: ['top', 'mid'],
  Ivern: ['jungle'],
  Janna: ['support'],
  JarvanIV: ['jungle'],
  Jax: ['top', 'jungle'],
  Jayce: ['top', 'mid'],
  Jhin: ['adc'],
  Jinx: ['adc'],
  Kaisa: ['adc'],
  Kalista: ['adc'],
  Karma: ['support', 'mid'],
  Karthus: ['jungle', 'mid'],
  Kassadin: ['mid'],
  Katarina: ['mid'],
  Kayle: ['top'],
  Kayn: ['jungle'],
  Kennen: ['top'],
  Khazix: ['jungle'],
  Kindred: ['jungle'],
  Kled: ['top'],
  KogMaw: ['adc'],
  KSante: ['top'],
  Leblanc: ['mid'],
  LeeSin: ['jungle'],
  Leona: ['support'],
  Lillia: ['jungle'],
  Lissandra: ['mid'],
  Locke: ['mid', 'jungle'],
  Lucian: ['adc', 'mid'],
  Lulu: ['support'],
  Lux: ['support', 'mid'],
  Malphite: ['top', 'support'],
  Malzahar: ['mid'],
  Maokai: ['support', 'jungle', 'top'],
  MasterYi: ['jungle'],
  Mel: ['mid', 'support'],
  Milio: ['support'],
  MissFortune: ['adc'],
  MonkeyKing: ['jungle', 'top'],
  Mordekaiser: ['top'],
  Morgana: ['support', 'jungle', 'mid'],
  Naafiri: ['mid', 'jungle'],
  Nami: ['support'],
  Nasus: ['top'],
  Nautilus: ['support'],
  Neeko: ['support', 'mid'],
  Nidalee: ['jungle'],
  Nilah: ['adc'],
  Nocturne: ['jungle'],
  Nunu: ['jungle'],
  Olaf: ['top', 'jungle'],
  Orianna: ['mid'],
  Ornn: ['top'],
  Pantheon: ['support', 'top', 'jungle', 'mid'],
  Poppy: ['jungle', 'top', 'support'],
  Pyke: ['support'],
  Qiyana: ['mid', 'jungle'],
  Quinn: ['top'],
  Rakan: ['support'],
  Rammus: ['jungle'],
  RekSai: ['jungle'],
  Rell: ['support', 'jungle'],
  Renata: ['support'],
  Renekton: ['top'],
  Rengar: ['jungle', 'top'],
  Riven: ['top'],
  Rumble: ['top', 'mid'],
  Ryze: ['mid', 'top'],
  Samira: ['adc'],
  Sejuani: ['jungle'],
  Senna: ['support', 'adc'],
  Seraphine: ['support', 'mid', 'adc'],
  Sett: ['top', 'support'],
  Shaco: ['jungle', 'support'],
  Shen: ['top', 'support'],
  Shyvana: ['jungle'],
  Singed: ['top'],
  Sion: ['top'],
  Sivir: ['adc'],
  Skarner: ['jungle', 'top'],
  Smolder: ['adc', 'mid'],
  Sona: ['support'],
  Soraka: ['support'],
  Swain: ['support', 'mid'],
  Sylas: ['mid', 'jungle'],
  Syndra: ['mid'],
  TahmKench: ['top', 'support'],
  Taliyah: ['mid', 'jungle'],
  Talon: ['mid', 'jungle'],
  Taric: ['support'],
  Teemo: ['top'],
  Thresh: ['support'],
  Tristana: ['adc', 'mid'],
  Trundle: ['top', 'jungle'],
  Tryndamere: ['top'],
  TwistedFate: ['mid'],
  Twitch: ['adc'],
  Udyr: ['jungle', 'top'],
  Urgot: ['top'],
  Varus: ['adc'],
  Vayne: ['adc', 'top'],
  Veigar: ['mid', 'support'],
  Velkoz: ['support', 'mid'],
  Vex: ['mid'],
  Vi: ['jungle'],
  Viego: ['jungle'],
  Viktor: ['mid'],
  Vladimir: ['mid', 'top'],
  Volibear: ['top', 'jungle'],
  Warwick: ['jungle', 'top'],
  Xayah: ['adc'],
  Xerath: ['support', 'mid'],
  XinZhao: ['jungle'],
  Yasuo: ['mid', 'top'],
  Yone: ['mid', 'top'],
  Yorick: ['top'],
  Yunara: ['adc'],
  Yuumi: ['support'],
  Zaahen: ['top', 'jungle'],
  Zac: ['jungle', 'top'],
  Zed: ['mid', 'jungle'],
  Zeri: ['adc'],
  Ziggs: ['adc', 'mid'],
  Zilean: ['support', 'mid'],
  Zoe: ['mid'],
  Zyra: ['support', 'jungle'],
};

const ICONIC_QUOTES_TR: Record<string, string> = {
  Aatrox: 'Ben düşman değilim. Ben DÜŞMANIN ta kendisiyim!',
  Ahri: 'Oyun oynamayalım mı? Ne dersin?',
  Akali: 'Korkudan titremiyorsan, bana karşı dikkatli değilsin demektir.',
  Akshan: 'Kötülükleri düzeltmeye ve harika görünmeye hazırım!',
  Alistar: 'Hiçbir şey beni durduramaz!',
  Ambessa: 'Güç, hak edenin değil, onu almaya cüret edenindir.',
  Amumu: 'Sanırım beni hiç seçmeyeceksin...',
  Anivia: 'Kanatlarımla fırtınayı getiririm.',
  Annie: 'Ayıcığım Tibbers’ı gördün mü?',
  Aphelios: 'Sessizlikte bile inancımız yankılanır.',
  Ashe: 'Tek kabile, tek halk, tek Freljord!',
  AurelionSol: 'Elbette beni seçecektin. Başka kim olabilir ki?',
  Aurora: 'İki âlem arasındaki perdenin ardını görebiliyorum.',
  Azir: 'Shurima! İmparatorun döndü!',
  Bard: '*Büyülü kozmik tınılar*',
  Belveth: 'Her şey Hiçlik’in bir parçası olacak.',
  Blitzcrank: 'Ateşlendi ve hizmete hazır.',
  Brand: 'Bu dünyayı küle çevirmeye hazır mısın?',
  Braum: 'Kalp, en güçlü kastır!',
  Briar: 'Acıktım! Hadi biraz eğlenelim!',
  Caitlyn: 'Tam isabet. Ben bu işi hallederim.',
  Camille: 'Hassasiyet, bir kasapla bir cerrahı ayıran tek şeydir.',
  Cassiopeia: 'Gözlerime bakmaya cesaretin var mı?',
  Chogath: 'Dünyayı yutmak istiyorum!',
  Corki: 'Görev emri alındı, kalkışa hazırım!',
  Darius: 'Noxus için kan dökmeye hazırlar mı?',
  Diana: 'Yeni bir ay doğuyor.',
  Draven: 'Draven Ligine hoş geldin!',
  DrMundo: 'Mundo nereye isterse oraya gider!',
  Ekko: 'Zaman önemli değil; önemli olan onu nasıl kullandığın.',
  Elise: 'Ağıma sadece aptallar düşer.',
  Evelynn: 'Beni seçtiğin için... pişman olmayacaksın.',
  Ezreal: 'Bir haritaya ihtiyacım yok, yolumu kendim bulurum!',
  Fiddlesticks: 'Korkunun hasadı başlıyor...',
  Fiora: 'Dengim yok, rakibim yok!',
  Fizz: 'Bırak dalgalar yutsun onları!',
  Galio: 'Kavgaya gitme vakti!',
  Gangplank: 'Ne ateş ne su beni durdurabilir!',
  Garen: 'Yüreğim ve kılıcım Demacia için!',
  Gnar: 'Gnar gada!',
  Gragas: 'Bensiz parti olmaz!',
  Graves: 'Ölü adam konuşmaz, sadece ben konuşurum.',
  Gwen: 'Makasım keskin, iğnem hazır!',
  Hecarim: 'Gölge Adalar’ın gazabını tadacaklar!',
  Heimerdinger: 'Gerçekten akıllıca bir seçim!',
  Hwei: 'Fırçamla acıyı sanata dönüştürüyorum.',
  Illaoi: 'Hareket etmeyi bırakma. Sınav şimdi başlıyor.',
  Irelia: 'Kadim vatanım Ionia için dans ediyorum!',
  Ivern: 'En sevdiğim renk ilkbahardır!',
  Janna: 'Fırtına emrine amade.',
  JarvanIV: 'Bu benim krallığım için!',
  Jax: 'Hadi gerçek bir silahım olsun... şaka yaptım, ihtiyacım yok!',
  Jayce: 'Daha parlak bir yarın için savaşıyorum!',
  Jhin: 'Katliamda, tıpkı şafakta açan bir çiçek gibi parlarım.',
  Jinx: 'Kurallar çiğnenmek için vardır... tıpkı binalar ve insanlar gibi!',
  Kaisa: 'Avcı mısın yoksa av mı?',
  Kalista: 'İhanet edenler bedelini ödeyecek.',
  Karma: 'Zihnini arındır, iradeni güçlendir.',
  Karthus: 'Ölüm şarkısı senin için çalıyor.',
  Kassadin: 'Denge korunmalı!',
  Katarina: 'Şiddet her şeyi çözer!',
  Kayle: 'Haklı olanlar yükselecek, suçlular yanacak.',
  Kayn: 'Rhaast mı yoksa ben mi? Göreceğiz.',
  Kennen: 'Fırtınanın gözleri daima açık.',
  Khazix: 'Değişim iyidir...',
  Kindred: 'Asla biri diğeri olmadan olmaz.',
  Kled: 'Burası BENİM toprağım! DEFOLUN!',
  KogMaw: 'Karnım acıktı, ziyafet vakti!',
  KSante: 'Nazumah’nın gururu asla eğilmez!',
  Leblanc: 'Kara Gül yeniden açacak.',
  LeeSin: 'İraden ellerine yön versin.',
  Leona: 'Şafak söktü!',
  Lillia: 'Rüyaların çiçek açmasına izin ver.',
  Lissandra: 'Buzda gömülü sırlar uyanıyor.',
  Lucian: 'Herkes ölür. Kimileri biraz yardıma ihtiyaç duyar.',
  Lulu: 'Mor tadında!',
  Lux: 'Aydınlık bize yol göstersin!',
  Malphite: 'Kaya gibi sağlam!',
  Malzahar: 'Unutulmuşluk kapıda.',
  Maokai: 'Adalar yeniden canlanacak.',
  MasterYi: 'Kılıcım senindir.',
  Mel: 'Her hamlenin ardında bir strateji yatar.',
  Milio: 'Ateşim iyileştirmek için yanıyor!',
  MissFortune: 'Şans cesurlardan yana değildir... ama benden yanadır!',
  MonkeyKing: 'En iyi olmak için durmadan çalışacağım!',
  Mordekaiser: 'Kader, hükmetme hakkımdır. Ölüler bana itaat eder.',
  Morgana: 'Kanatlarım acıyla bilenmiş durumda.',
  Naafiri: 'Sürüyle avlan, tek başına parçala!',
  Nami: 'Dalgaların ne getireceğine ben karar veririm.',
  Nasus: 'Yaşam ve ölüm döngüsü devam eder. Biz yaşarız, onlar ölür.',
  Nautilus: 'Derinliklerden yükselen bir gölge...',
  Neeko: 'Neeko meraklı bir bukalemun!',
  Nidalee: 'Onlara vahşeti göstereceğim!',
  Nilah: 'Neşe benim silahım, korkusuzluk zırhım!',
  Nocturne: 'Karanlığı kucakla...',
  Nunu: 'Her macera bir arkadaşla daha güzeldir!',
  Olaf: 'Arkanda hiçbir şey bırakma!',
  Orianna: 'Saat gibi işleyen bir ölüm dansı.',
  Ornn: 'İyi bir demirci sabırlıdır.',
  Pantheon: 'Gökyüzüne meydan okuyorum!',
  Poppy: 'Kahraman mı? Ben sadece çekicimi taşıyorum.',
  Pyke: 'Listemde bir isim daha var...',
  Qiyana: 'İmparatoriçene itaat et!',
  Quinn: 'Gözlerimiz gökyüzünde, Valor!',
  Rakan: 'Hadi şov başlasın!',
  Rammus: 'Tamam.',
  RekSai: '*Korkunç Hiçlik Çığlığı*',
  Rell: 'Kimse bir daha benim gibi kırılmayacak.',
  Renata: 'Başarı, herkesin ödeyemeyeceği bir bedeldir.',
  Renekton: 'Yaşadıkça hepsi ölecek!',
  Rengar: 'Bu gece... avlanacağız!',
  Riven: 'Kırık olan yeniden dövülebilir.',
  Rumble: 'Hurda yığınım hepsini ezmeye hazır!',
  Ryze: 'Dünyayı kurtarmak için koşmaya devam etmeliyim.',
  Samira: 'Tarz olmadan zaferin ne anlamı var?',
  Sejuani: 'Kışın merhameti yoktur!',
  Senna: 'Karanlıkta bile ışık yolunu bulur.',
  Seraphine: 'Seslerimiz birleştiğinde dünyayı değiştirebiliriz!',
  Sett: 'Patron sahneye çıktı. Kemerleri bağlayın!',
  Shaco: 'Peki ya bir sihir numarasına ne dersin?',
  Shen: 'Dengenin hükmü yerine getirilecek.',
  Shyvana: 'Ejderhanın öfkesinden korksunlar!',
  Singed: 'Karıştır, çalkala, patlat!',
  Sion: 'SAVAŞ! BANA KAN VERİN!',
  Sivir: 'Altını getir, işini bitireyim.',
  Skarner: 'Toprak her adımı hatırlar.',
  Smolder: 'Annem beklesin, ben uçabiliyorum!',
  Sona: 'Sadece sen beni duyabilirsin, sihirdar.',
  Soraka: 'Yıldızlar bana rehberlik ediyor.',
  Swain: 'Gücün ne olduğunu bildiklerini sanıyorlar.',
  Sylas: 'Zincirler kırılacak, krallıklar yıkılacak!',
  Syndra: 'Sınırsız güç! Başka ne isteyebilirim ki?',
  TahmKench: 'Bana nehir kralı derler... ve her zaman ödetirim.',
  Taliyah: 'Taşları ör, dağları aş!',
  Talon: 'Yaşamak ve ölmek kılıcın ucunda.',
  Taric: 'Mücevherler... gerçekten büyüleyici.',
  Teemo: 'Yüzbaşı Teemo göreve hazır!',
  Thresh: 'Ne muhteşem bir azap çıkaracağız!',
  Tristana: 'Bir kere ateş etmeye başladım mı duramam!',
  Trundle: 'Trol vakti geldi!',
  Tryndamere: 'Bu katliam hiç bitmeyecek!',
  TwistedFate: 'Şanslı hanım bana gülümsüyor.',
  Twitch: 'İşte geliyorum! Saklanmayın!',
  Udyr: 'Ruhların öfkesi içimde uyanıyor.',
  Urgot: 'Acı çekmeden gerçek gücü anlayamazsın.',
  Varus: 'İntikam oku asla şaşmaz.',
  Vayne: 'Karanlıkta avlanalım.',
  Veigar: 'Kısa olduğum için mi gülüyorsun?!',
  Velkoz: 'Parçalayarak öğrenmek en doğrusu.',
  Vex: 'Of... illa savaşmak zorunda mıyız?',
  Vi: 'Önce vur, vururken soru sor!',
  Viego: 'Isolde olmadan her şey boş...',
  Viktor: 'Muhteşem evrime katıl!',
  Vladimir: 'Nehirler kızıl akacak.',
  Volibear: 'Fırtına benimle birlikte kükrüyor!',
  Warwick: 'Kan kokusu alıyorum... av başlıyor!',
  Xayah: 'Tüylerim keskindir, dikkat et.',
  Xerath: 'Saf enerji, saf kudret!',
  XinZhao: 'Arenaya hoş geldiniz!',
  Yasuo: 'Ölüm de rüzgâr gibi; hep yanı başımda.',
  Yone: 'Tek kılıç kesmeye, tek kılıç mühürlemeye.',
  Yorick: 'Mezar kazıcının işi hiç bitmez.',
  Yuumi: 'Kitap ve ben en iyi takımız!',
  Zac: 'Beni yere serebilirsin ama zıplayıp kalkarım!',
  Zed: 'Görülmeyen bıçak en ölümcül olandır.',
  Zeri: 'Ben kıvılcımım, fırtınayı ben başlatırım!',
  Ziggs: 'Bu çok eğlenceli olacak!',
  Zilean: 'Zaman akıp giderken ben her şeyi gördüm.',
  Zoe: 'Kozmik macera zamanı!',
  Zyra: 'Dikenlerin kucağını hisset!',
};

export const YOUTUBE_CHALLENGES: YoutubeChallenge[] = [
  {
    id: 'full-ap',
    title: 'Sadece AP Build',
    description: 'Şampiyon AD olsa bile sadece Yetenek Gücü (AP) eşyaları al!',
    difficulty: 'ZOR',
  },
  {
    id: 'no-flash',
    title: 'Sıçra (Flash) Yasak!',
    description: 'Bu maç Sıçra alamazsın. Hayalet, Tutuştur veya Bariyer kullan!',
    difficulty: 'ORTA',
  },
  {
    id: 'full-ms',
    title: 'Formula 1 (Full Hız)',
    description: 'Alacağın her eşya Hareket Hızı vermeli. Kimse seni yakalayamasın!',
    difficulty: 'ORTA',
  },
  {
    id: 'dark-harvest',
    title: 'Kara Hasat Tek Atma',
    description: 'Rünlerin mutlaka Kara Hasat olmalı ve sadece tek atma eşyaları kas!',
    difficulty: 'KOLAY',
  },
  {
    id: 'mejais',
    title: 'İlk Eşya Mejai / Karayel',
    description: 'İlk dönüşte Kara Mühür al ve 25 yük yapmadan oyunu bitirme!',
    difficulty: 'ZOR',
  },
  {
    id: 'no-recall',
    title: 'Ölmeden Base Atmak Yok!',
    description: 'Üsse (Base) yürüyerek veya B basarak dönemezsin. Sadece ölünce eşya al!',
    difficulty: 'İMKÂNSIZ',
  },
  {
    id: 'lethality',
    title: 'Tam Zırh Deşme (Lethality)',
    description: 'Şampiyon ne olursa olsun full Zırh Deşme / Suikastçı eşyalarıyla oyna!',
    difficulty: 'ZOR',
  },
  {
    id: 'heartsteel',
    title: 'Çelikyürek (Heartsteel) Devliği',
    description: 'İlk eşya mutlaka Çelikyürek! Maç boyunca devleşip stack kas!',
    difficulty: 'KOLAY',
  },
  {
    id: 'no-boots',
    title: 'Çizmesiz 6 Eşya',
    description: 'Oyun sonuna kadar Çizme almak yasak! Yerine 6. hasar eşyasını al.',
    difficulty: 'ORTA',
  },
  {
    id: 'level1-invade',
    title: '1. Seviye Zorunlu Baskın',
    description: 'Oyun başlar başlamaz takımı topla ve rakip ormana baskın at!',
    difficulty: 'KOLAY',
  },
];

export const CHAMPIONS: Champion[] = Object.values(rawChampionsTr.data)
  .map((c: any) => {
    const firstSentence = (c.blurb || '').split('.')[0]?.trim();
    const fallbackQuote = firstSentence ? `${firstSentence}.` : `${c.name}, ${c.title}.`;
    return {
      id: c.id,
      key: c.key,
      name: c.name,
      title: c.title,
      blurb: c.blurb,
      tags: c.tags as ChampionTag[],
      partype: c.partype,
      info: c.info,
      lanes: CHAMPION_LANES[c.id] || ['mid'],
      region: CHAMPION_REGIONS[c.id] || 'runeterra',
      quote: ICONIC_QUOTES_TR[c.id] || fallbackQuote,
      version: c.version || DDRAGON_VERSION,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'tr'));

export function getChampionPortraitUrl(id: string) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_0.jpg`;
}

export function getChampionSplashUrl(id: string, skinNum = 0) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_${skinNum}.jpg`;
}

export function getChampionIconUrl(id: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${id}.png`;
}

export function getChooseVoUrl(key: string, lang: 'tr_tr' | 'default' = 'tr_tr') {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/${lang}/v1/champion-choose-vo/${key}.ogg`;
}

export function getBanVoUrl(key: string, lang: 'tr_tr' | 'default' = 'tr_tr') {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/${lang}/v1/champion-ban-vo/${key}.ogg`;
}

export function getLockInSfxUrl(key: string) {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-sfx-audios/${key}.ogg`;
}

function cdragonAssetToUrl(assetPath: string): string {
  if (!assetPath) return '';
  const cleaned = assetPath
    .replace(/^\/lol-game-data\/assets\//i, '')
    .toLowerCase();
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${cleaned}`;
}

export async function fetchChampionDetails(key: string, champId: string): Promise<ChampionDetails | null> {
  try {
    const res = await fetch(
      `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/tr_tr/v1/champions/${key}.json`
    );
    if (!res.ok) return null;
    const data = await res.json();

    const skins: ChampionSkin[] = Array.isArray(data.skins)
      ? data.skins
          .filter((s: any) => s && typeof s.id === 'number')
          .slice(0, 12)
          .map((s: any) => {
            const skinNum = s.id % 1000;
            const cdragonSplash = s.uncenteredSplashPath || s.splashPath;
            return {
              id: s.id,
              name: s.isBase ? 'Klasik' : s.name,
              isBase: Boolean(s.isBase),
              splashUrl: cdragonSplash
                ? cdragonAssetToUrl(cdragonSplash)
                : getChampionSplashUrl(champId, skinNum),
            };
          })
      : [{ id: 0, name: 'Klasik', isBase: true, splashUrl: getChampionSplashUrl(champId, 0) }];

    const abilities: ChampionAbility[] = [];
    if (data.passive) {
      abilities.push({
        key: 'P',
        name: data.passive.name || 'Pasif',
        description: stripHtml(data.passive.description || ''),
        iconUrl: cdragonAssetToUrl(data.passive.abilityIconPath),
      });
    }
    if (Array.isArray(data.spells)) {
      for (const spell of data.spells) {
        abilities.push({
          key: (spell.spellKey || '?').toUpperCase(),
          name: spell.name || '',
          description: stripHtml(spell.description || ''),
          iconUrl: cdragonAssetToUrl(spell.abilityIconPath),
        });
      }
    }

    return {
      shortBio: data.shortBio || '',
      primaryTag: data.championTagInfo?.championTagPrimary,
      secondaryTag: data.championTagInfo?.championTagSecondary,
      damageType: data.tacticalInfo?.damageType,
      playstyleInfo: data.playstyleInfo,
      skins,
      abilities,
      hasChooseVo: Boolean(data.chooseVoPath),
      hasBanVo: Boolean(data.banVoPath),
    };
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}
