// Simple AABB overlap — works in all Excalibur versions
export function overlaps(a, b) {
    const aLeft   = a.pos.x - a.width  / 2
    const aRight  = a.pos.x + a.width  / 2
    const aTop    = a.pos.y - a.height / 2
    const aBottom = a.pos.y + a.height / 2

    const bLeft   = b.pos.x - b.width  / 2
    const bRight  = b.pos.x + b.width  / 2
    const bTop    = b.pos.y - b.height / 2
    const bBottom = b.pos.y + b.height / 2

    return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop
}