export type Lang = "en" | "ar";

const translations = {
  appName:           { en: "WeatherBoard",                        ar: "لوحة الطقس"                    },
  refresh:           { en: "Refresh",                             ar: "تحديث"                          },
  searchPlaceholder: { en: "Enter city (e.g. Dubai, London...)",  ar: "أدخل المدينة (مثل: دبي، لندن...)" },
  searchBtn:         { en: "Search",                              ar: "بحث"                            },
  myLocation:        { en: "My Location",                         ar: "موقعي"                          },
  locationDenied:    { en: "Denied",                              ar: "مرفوض"                          },
  locating:          { en: "Locating...",                         ar: "جاري التحديد..."                },
  youAreIn:          { en: "You are in",                          ar: "أنت في"                         },
  quickSwitch:       { en: "Quick Switch — UAE Emirates",         ar: "تبديل سريع — إمارات الإمارات"   },
  tabNow:            { en: "Now",                                 ar: "الآن"                           },
  tabDaily:          { en: "Daily",                               ar: "يومي"                           },
  tabHourly:         { en: "Hourly",                              ar: "كل ساعة"                        },
  tabMap:            { en: "🗺 Map",                              ar: "🗺 خريطة"                       },
  tabExplore:        { en: "🧭 Explore",                          ar: "🧭 استكشف"                      },
  tabAI:             { en: "🤖 AI",                               ar: "🤖 ذكاء"                        },
  tabSaved:          { en: "💾 Saved",                            ar: "💾 محفوظ"                       },
  feelsLike:         { en: "Feels like",                          ar: "يبدو كـ"                        },
  humidity:          { en: "Humidity",                            ar: "الرطوبة"                        },
  rainChance:        { en: "Rain chance",                         ar: "احتمال المطر"                   },
  windSpeed:         { en: "Wind speed",                          ar: "سرعة الرياح"                    },
  pressure:          { en: "Pressure",                            ar: "الضغط"                          },
  visibility:        { en: "Visibility",                          ar: "الرؤية"                         },
  uvIndex:           { en: "UV index",                            ar: "مؤشر الأشعة"                    },
  cloudCover:        { en: "Cloud cover",                         ar: "الغيوم"                         },
  dewPoint:          { en: "Dew point",                           ar: "نقطة الندى"                     },
  windGust:          { en: "Wind gust",                           ar: "عصفات الرياح"                   },
  solarEnergy:       { en: "Solar energy",                        ar: "الطاقة الشمسية"                 },
  sunrise:           { en: "Sunrise",                             ar: "شروق الشمس"                     },
  sunset:            { en: "Sunset",                              ar: "غروب الشمس"                     },
  heatIndex:         { en: "Heat Index",                          ar: "مؤشر الحرارة"                   },
  outdoorSafety:     { en: "Outdoor Safety",                      ar: "السلامة الخارجية"               },
  roadVisibility:    { en: "Road Visibility",                     ar: "رؤية الطريق"                    },
  beachConditions:   { en: "Beach Conditions",                    ar: "أحوال الشاطئ"                   },
  desertZone:        { en: "Desert Zone",                         ar: "المنطقة الصحراوية"              },
  alertSandstorm:    { en: "Sandstorm Warning",                   ar: "تحذير عاصفة رملية"              },
  alertFog:          { en: "Fog Warning",                         ar: "تحذير ضباب"                     },
  alertHeat:         { en: "Extreme Heat Warning",                ar: "تحذير حرارة شديدة"              },
  alertRain:         { en: "Rain Alert",                          ar: "تنبيه مطر"                      },
  alertDismiss:      { en: "Dismiss",                             ar: "إغلاق"                          },
  savedTitle:        { en: "Saved Destinations",                  ar: "الوجهات المحفوظة"               },
  saveThis:          { en: "Save",                                ar: "حفظ"                            },
  saved:             { en: "Saved ✓",                             ar: "محفوظ ✓"                        },
  noSaved:           { en: "No saved destinations yet.",          ar: "لا توجد وجهات محفوظة بعد."      },
  removeSaved:       { en: "Remove",                              ar: "إزالة"                          },
  clearAll:          { en: "Clear all",                           ar: "مسح الكل"                       },
  ramadanTitle:      { en: "Ramadan Weather",                     ar: "طقس رمضان"                      },
  suhoor:            { en: "Suhoor time",                         ar: "وقت السحور"                     },
  iftar:             { en: "Iftar time",                          ar: "وقت الإفطار"                    },
  outdoorFasting:    { en: "Outdoor fasting tips",                ar: "نصائح الصيام الخارجي"           },
  fastingHours:      { en: "Fasting hours",                       ar: "ساعات الصيام"                   },
  distanceTo:        { en: "Distance to",                         ar: "المسافة إلى"                    },
  navigate:          { en: "Navigate",                            ar: "تنقل"                           },
  loading:           { en: "Fetching weather data...",            ar: "جاري تحميل بيانات الطقس..."     },
  langToggle:        { en: "عربي",                                ar: "English"                        },
  installApp:        { en: "Install App",                         ar: "تثبيت التطبيق"                  },
  offlineReady:      { en: "Offline ready",                       ar: "يعمل بدون إنترنت"               },
} as const;


type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
    return translations[key][lang]
}

export type {TranslationKey};
export default translations;

// keyof typeof translations

// automatically creates a union containing all your translation keys:

// "appName"
// | "refresh"
// | "searchPlaceholder"
// | "searchBtn"
// | "myLocation"
// | ...
// | "offlineReady"