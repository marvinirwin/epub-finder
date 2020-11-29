declare module 'ciseaux/browser' {
    export interface Tape {
        slice: (n: number, n2?: number) => Tape;
        duration: number;
        render: () => Promise<AudioBuffer>
    }
    export interface Ciseaux {
        context: AudioContext,
        from: (s: string) => Promise<Tape>
    }
    const config: Ciseaux = {
    }
    export default config;
}
