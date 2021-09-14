import { interpolateBlues, interpolateReds } from 'd3-scale-chromatic'

const p1 = []
const p2 = []

let id = 0

for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 20
    const y = Math.random() * 20
    const tc = Math.random()

    p1.push({id: id, x: x, tc: tc, y: y, size: 5, color: interpolateReds(Math.random())})
    id += 1
}

for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 20
    const y = Math.random() * 20
    const tc = Math.random()

    p2.push({id: id, tc: tc, x: x, y: y, size: 10, color: interpolateBlues(Math.random())})
    id += 1
}

export default { p1, p2 }
