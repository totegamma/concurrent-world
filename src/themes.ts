import { alpha, createTheme } from '@mui/material'
import type { ConcurrentTheme } from './model'
import { type DeepPartial } from './util'

export const Themes: Record<string, DeepPartial<ConcurrentTheme>> = {
    blue: {
        meta: {
            name: 'blue',
            author: 'CCb72AAc9dcF088F7088b6718BE5a494fBB3861439', // totegamma
            comment: 'コンカレで一番最初に作られたテーマです！'
        },
        palette: {
            primary: {
                main: '#0476d9'
            },
            secondary: {
                main: '#1e6476'
            },
            background: {
                default: '#023059',
                contrastText: '#ffffff'
            }
        }
    },
    blue2: {
        meta: {
            name: 'blue2',
            author: 'CCBFe6f64AEE52A200B7C47D3D83680A226967d83C', // waonme
            comment: 'コンカレで二番目に作られたわけではないテーマです！'
        },
        palette: {
            primary: {
                main: '#116691'
            },
            secondary: {
                main: '#b3f6ff'
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
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    '::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px'
                    }
                }
            }
        }
    },
    darkgray: {
        meta: {
            name: 'darkgray',
            author: 'CCBFe6f64AEE52A200B7C47D3D83680A226967d83C', // waonme
            comment: '黒背景よりはダークグレーの方が落ち着くんだ'
        },
        palette: {
            primary: {
                main: '#555',
                contrastText: '#ffffff'
            },
            secondary: {
                main: '#d7d7d7'
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
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    '::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px'
                    }
                }
            }
        },
        shape: {
            borderRadius: 2
        }
    },
    cafe: {
        meta: {
            name: 'cafe',
            author: 'CCBFe6f64AEE52A200B7C47D3D83680A226967d83C', // waonme
            comment: 'すくなくともスタバではなさそうだ'
        },
        palette: {
            primary: {
                main: '#663741'
            },
            secondary: {
                main: '#663e37'
            },
            background: {
                default: '#a99996',
                paper: '#f7efea',
                contrastText: '#ffffff'
            }
        },
        shape: {
            borderRadius: 2
        }
    },
    rainyday: {
        meta: {
            name: 'rainyday',
            author: 'CCBFe6f64AEE52A200B7C47D3D83680A226967d83C', // waonme
            comment: 'そういう日もある'
        },
        palette: {
            primary: {
                main: '#70868b'
            },
            secondary: {
                main: '#4d6662'
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
        },
        shape: {
            borderRadius: 0
        }
    },
    sacher: {
        meta: {
            name: 'sacher',
            author: 'CCBFe6f64AEE52A200B7C47D3D83680A226967d83C', // waonme
            comment:
                '![ザッハさん](https://worldfile.cc/CCBFe6f64AEE52A200B7C47D3D83680A226967d83C/988bf80b-96ca-4bb9-83ff-cd962932b616)'
        },
        palette: {
            primary: {
                main: '#c77e18',
                contrastText: '#fffefa'
            },
            secondary: {
                main: '#4a5a54'
            },
            background: {
                default: '#188aa3',
                paper: '#f6f1e0',
                contrastText: '#fffef8'
            },
            text: {
                primary: '#2e0d03',
                secondary: '#4c6675',
                disabled: 'rgba(0, 0, 0, 0.5)'
            },
            divider: 'rgba(0, 0, 0, 0.2)'
        },
        shape: {
            borderRadius: 3
        }
    }
}

export const ConcurrentDefaultTheme = {
    palette: {
        primary: {
            main: '#7e7e7e'
        },
        secondary: {
            main: '#737373'
        },
        background: {
            default: '#9e9e9e',
            contrastText: '#ffffff'
        },
        text: {
            primary: '#000000',
            secondary: '#000000',
            disabled: 'rgba(0, 0, 0, 0.5)'
        }
    },
    typography: {
        fontSize: 14,
        body1: {
            fontSize: '1rem'
        },
        h1: {
            fontSize: 32,
            fontWeight: 700
        },
        h2: {
            fontSize: 24,
            fontWeight: 700
        },
        h3: {
            fontSize: 19.2,
            fontWeight: 700
        },
        h4: {
            fontSize: 16,
            fontWeight: 700
        },
        h5: {
            fontSize: 12.8,
            fontWeight: 700
        },
        h6: {
            fontSize: 11.2,
            fontWeight: 700
        }
    },
    transitions: {
        duration: {
            entieringScreen: 50,
            leavingScreen: 50
        }
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 450,
            md: 960,
            lg: 1280,
            xl: 1920
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    padding: '4px 16px'
                }
            },
            defaultProps: {
                variant: 'contained'
            }
        },
        MuiCssBaseline: {
            styleOverrides: {
                '::-webkit-scrollbar': {
                    width: '10px',
                    height: '10px'
                },
                '::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '10px'
                },
                html: {
                    overscrollBehaviorY: 'none'
                },
                body: {
                    overflowX: 'hidden'
                },
                '.snackbar-container-mobile': {
                    bottom: 'calc(55px + env(safe-area-inset-bottom))'
                }
            }
        }
    },
    shape: {
        borderRadius: 4
    }
}

function isObject(item: any): item is object {
    return item && typeof item === 'object' && !Array.isArray(item)
}

export function deepMerge(target: Record<string, any>, source: Record<string, any>): ConcurrentTheme {
    const output = { ...target }

    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key: string) => {
            if (isObject(source[key])) {
                if (!(key in target)) Object.assign(output, { [key]: source[key] })
                else output[key] = deepMerge(target[key], source[key])
            } else {
                Object.assign(output, { [key]: source[key] })
            }
        })
    }
    return output as ConcurrentTheme
}

export const createConcurrentThemeFromObject = (base: any): ConcurrentTheme => {
    if (base.palette.text !== undefined) {
        if (base.palette.text.hint === undefined) base.palette.text.hint = alpha(base.palette.text.primary, 0.5)
        if (base.palette.text.disabled === undefined) base.palette.text.disabled = alpha(base.palette.text.primary, 0.5)
        if (base.palette.divider === undefined) base.palette.divider = alpha(base.palette.text.primary, 0.12)
    }

    if (base.palette.text?.primary && !base.components)
        base.components = {
            MuiCssBaseline: {
                styleOverrides: {
                    '::-webkit-scrollbar-thumb': {
                        backgroundColor: alpha(base.palette.text.primary, 0.2)
                    }
                }
            }
        }

    const theme: ConcurrentTheme = deepMerge(ConcurrentDefaultTheme, base)
    return createTheme(theme) as ConcurrentTheme
}

export const loadConcurrentTheme = (
    name: string,
    customs: Record<string, DeepPartial<ConcurrentTheme>> = {}
): ConcurrentTheme => {
    const base = customs[name] ?? Themes[name] ?? Themes.blue
    return createConcurrentThemeFromObject(base)
}
