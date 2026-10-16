import { useEffect, useState } from 'react';
import api from './api.js';

// Loads a public list endpoint, e.g. useList('/courses')
export function useList(path) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let alive = true;
        setLoading(true);
        api.get(path)
            .then((r) => alive && setItems(Array.isArray(r.data) ? r.data : []))
            .catch(() => alive && setItems([]))
            .finally(() => alive && setLoading(false));
        return () => { alive = false; };
    }, [path]);
    return { items, loading };
}
