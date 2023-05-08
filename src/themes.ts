import { createTheme } from '@mui/material'
import type { ConcurrentTheme } from './model'
import type { DeepPartial } from './util'

export const Themes: Record<string, DeepPartial<ConcurrentTheme>> = {
    basic: {
        palette: {
            primary: {
                main: '#7e7e7e'
            },
            background: {
                default: '#9e9e9e',
                contrastText: '#ffffff'
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
                contrastText: '#ffffff'
            }
        }
    },
    highcontrast_bw: {
        palette: {
            primary: {
                main: '#ffffff'
            },
            background: {
                default: '#000000',
                paper: '#000000',
                contrastText: '#ffffff'
            },
            text: {
                primary: '#ffffff',
                secondary: 'rgba(255, 255, 255, 0.797)',
                disabled: 'rgba(255, 255, 255, 0.703)'
            },
            divider: 'rgba(255, 255, 255, 0.2)'
        }
    },
    highcontrast_yb: {
        palette: {
            primary: {
                main: '#f7cd12'
            },
            background: {
                default: '#000057',
                paper: '#000000',
                contrastText: '#fffF46'
            },
            text: {
                primary: '#ffffff',
                secondary: 'rgba(255, 255, 255, 0.7)',
                disabled: 'rgba(255, 255, 255, 0.5)'
            },
            divider: 'rgba(255, 255, 255, 0.2)'
        }
    },
    rabbuttz: {
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
    gammalab: {
        palette: {
            primary: {
                main: '#FFF'
            },
            background: {
                default: '#0476D9',
                paper: '#FFF',
                contrastText: '#FFF'
            },
            divider: '#FFF'
        }
    },
    tote: {
        palette: {
            primary: {
                main: '#0469c1',
                contrastText: '#81e4ff'
            },
            background: {
                default: '#ffd54c',
                paper: '#FFF',
                contrastText: '#423e3e'
            },
            text: {
                primary: '#363636',
                secondary: 'rgba(58, 35, 32, 0.8)',
                disabled: 'rgba(255, 255, 255, 0.6)'
            },
            divider: 'rgba(255, 255, 255, 0.421)'
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
            },
            text: {
                primary: '#232d31',
                secondary: 'rgba(52, 61, 66, 0.7)',
                disabled: 'rgba(0, 0, 0, 0.5)'
            },
            divider: 'rgba(0, 0, 0, 0.2)'
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
    redmond: {
        palette: {
            primary: {
                main: '#00007C',
                contrastText: '#FFF'
            },
            background: {
                default: '#377E7F',
                paper: '#ffffff',
                contrastText: '#ffffff'
            }
        }
    },
    ニンテン: {
        palette: {
            primary: {
                main: '#7f2f2f',
                contrastText: '#ffeba8'
            },
            background: {
                default: '#e3dccc',
                paper: '#f6f1e0',
                contrastText: '#514a29'
            },
            text: {
                primary: '#1a1a18',
                secondary: 'rgba(0, 0, 0, 0.7)',
                disabled: 'rgba(0, 0, 0, 0.5)'
            },
            divider: 'rgba(0, 0, 0, 0.2)'
        }
    },
    sacher: {
        palette: {
            primary: {
                main: '#c77e18',
                contrastText: '#fffefa'
            },
            background: {
                default: '#188aa3',
                paper: '#f6f1e0',
                contrastText: '#fffef8'
            },
            text: {
                primary: '#2e0d03',
                secondary: '#4c6675ff',
                disabled: 'rgba(0, 0, 0, 0.5)'
            },
            divider: 'rgba(0, 0, 0, 0.2)'
        }
    },
    blue2: {
        palette: {
            primary: {
                main: '#116691'
            },
            background: {
                default: '#211a3d',
                paper: '#202c4b',
                contrastText: '#dbfafc'
            },
            text: {
                primary: '#fff',
                secondary: 'rgba(255, 255, 255, 0.8)',
                disabled: 'rgba(255, 255, 255, 0.6)'
            },
            divider: 'rgba(255, 255, 255, 0.2)'
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
    },
    messy: {
        palette: {
            primary: {
                main: '#7f2f2f',
                contrastText: '#fff2c3'
            },
            background: {
                default: '#17161e',
                paper: '#1f181c',
                contrastText: '#f1f1ca'
            },
            text: {
                primary: '#fbffd4',
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
