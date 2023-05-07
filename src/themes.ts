import { createTheme } from '@mui/material'
import type { ConcurrentTheme } from './model'
import type { DeepPartial } from './util'

export const Themes: Record<string, DeepPartial<ConcurrentTheme>> = {
    basic: {
        palette: {
            primary: {
                main: '#FFF'
            }
        }
    },
    red: {
        palette: {
            primary: {
                main: '#E0576F'
            },
            background: {
                default: '#C74E64',
                contrastText: '#ffffff'
            }
        }
    },
    blue: {
        palette: {
            primary: {
                main: '#0476d9'
            },
            background: {
                default: '#023059',
                contrastText: '#ffffff'
            }
        }
    },
    orange: {
        palette: {
            primary: {
                main: '#c52b26'
            },
            background: {
                default: '#e07d43',
                paper: '#f8efdd',
                contrastText: '#ffffff'
            }
        }
    },
    cafe: {
        palette: {
            primary: {
                main: '#663741'
            },
            background: {
                default: '#a99996',
                paper: '#f7efea',
                contrastText: '#ffffff'
            }
        }
    },
    rainyday: {
        palette: {
            primary: {
                main: '#70868b'
            },
            background: {
                default: '#839fa1',
                paper: '#ebf3f5',
                contrastText: '#ffffff'
            }
        }
    },
    oldcomputing: {
        palette: {
            primary: {
                main: '#939195'
            },
            background: {
                default: '#6d6d70',
                paper: '#f0edf1',
                contrastText: '#ffffff'
            }
        }
    },
    highcontrast: {
        palette: {
            primary: {
                main: '#2222ee'
            },
            background: {
                default: '#000000',
                paper: '#f0edf1',
                contrastText: '#ffffff'
            }
        }
    },
    highcontrast2: {
        palette: {
            primary: {
                main: '#dbb715'
            },
            background: {
                default: '#1e1ea0',
                paper: '#f0ede7',
                contrastText: '#ffffff'
            }
        }
    },
    blue2: {
        palette: {
            primary: {
                main: '#5c7eee'
            },
            background: {
                default: '#151542',
                paper: '#afc8e9',
                contrastText: '#ffffff'
            }
        }
    },
    darkgray: {
        palette: {
            primary: {
                main: '#555',
                contrastText: '#ffffff'
            },
            secondary: {
                main: '#888'
            },
            background: {
                default: '#333333',
                paper: '#222',
                contrastText: '#ffffff'
            },
            text: {
                primary: '#fff',
                secondary: 'rgba(255, 255, 255, 0.7)',
                disabled: 'rgba(255, 255, 255, 0.5)'
            },
            divider: 'rgba(255, 255, 255, 0.2)'
        }
    }
}

export const ConcurrentDefaultTheme = {
    palette: {
        background: {
            contrastText: '#ffffff'
        }
    },
    typography: {
        h1: {
            fontSize: 32
        },
        h2: {
            fontSize: 24
        },
        h3: {
            fontSize: 19.2
        },
        h4: {
            fontSize: 16
        },
        h5: {
            fontSize: 12.8
        },
        h6: {
            fontSize: 11.2
        }
    }
}

export const createConcurrentTheme = (name: string): ConcurrentTheme => {
    const theme: ConcurrentTheme = Object.assign(
        createTheme(),
        Object.assign(ConcurrentDefaultTheme, Themes[name])
    )
    return createTheme(theme) as ConcurrentTheme
}
