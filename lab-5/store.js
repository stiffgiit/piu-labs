export class Store {
    constructor(key = 'lab5-shapes') {
    this.key = key;
    this.subscribers = new Set();
    this.state = { shapes: [] };
    this.lastAction = null;
    
    
    try {
    const raw = localStorage.getItem(this.key);
    if (raw) this.state = JSON.parse(raw);
    } catch (e) {
    console.warn('Nie udało się wczytać localStorage', e);
    }
    }
    
    
    getState() {
    return JSON.parse(JSON.stringify(this.state));
    }
    
    
    subscribe(fn) {
    this.subscribers.add(fn);
    fn({ state: this.getState(), action: null });
    return () => this.subscribers.delete(fn);
    }
    
    
    notify(action) {
    try {
    localStorage.setItem(this.key, JSON.stringify(this.state));
    } catch (e) {
    console.warn('Nie udało się zapisać do localStorage', e);
    }
    for (const s of this.subscribers) {
    s({ state: this.getState(), action });
    }
    }
    
    
    dispatch(action) {
    switch (action.type) {
    case 'ADD':
    this.state.shapes.push(action.payload);
    this.lastAction = action;
    break;
    case 'REMOVE':
    this.state.shapes = this.state.shapes.filter(s => s.id !== action.payload.id);
    this.lastAction = action;
    break;
    case 'RECOLOR_TYPE':
    this.state.shapes = this.state.shapes.map(s => (
    s.type === action.payload.type ? { ...s, color: action.payload.color } : s
    ));
    this.lastAction = action;
    break;
    default:
    console.warn('Nieznana akcja', action);
    }
    this.notify(action);
    }
    }
    
    
    export default new Store();