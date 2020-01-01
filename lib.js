exports = {};
exports = ((exports) => {
    const _cacheThreashhold = 1000;
    let _cache = {};
    let _cached = 0;
    let div = document.createElement("div");
    document.head.appendChild(div);
    const Util = {
        deHex(arr) {
            return arr.map(val => parseInt(val, 16));
        },
        toRGB(c) {
            if (_cache[c]) return _cache[c];
            div.style.color = c;
            let r = getComputedStyle(div).color;
            _cache[c] = r;
            _cached++;
            if (_cached > _cacheThreashhold) {
                _cache = {};
                _cached = 0;
                console.log("clearing color parse cache")
            }
            return r;
        },
        clamp(value, min, max) {
            return Math.min(max, Math.max(min, value));
        },
        lerpNumber(start, end, percent) {
            return start + (end - start) * percent;
        },
        hex(number) {
            let n = number.toString(16);
            if (n.length === 1) return "0" + n;
            return n;
        }
    }

    const COL_Interval = 255 / 16;
    const COL_RGBMax = 255;
    class Color {
        constructor(r, g, b, a) {
            if (Number.isNaN(+r)) {
                let other = Color.fromString(r);
                this._r = other._r;
                this._b = other._b;
                this._g = other._g;
                this._a = other._a;
            } else {
                this._r = Util.clamp(Math.round(+r), 0, 255);
                this._g = Util.clamp(Math.round(+g), 0, 255);
                this._b = Util.clamp(Math.round(+b), 0, 255);
                this._a = Util.clamp(+a, 0, 1);
            }
        }
        static fromString(colStr) {
            if (/#[0-9A-F]{3,4}|#[0-9A-F]{6}|#[0-9A-F]{8}/.exec(colStr)) {
                return Color.fromHex(colStr);
            } else if (/rgb/.exec(colStr)) {
                return Color.fromRGB(colStr);
            } else {
                return Color.fromColorString(colStr);
            }
        }
        static fromHex(hexStr) {
            hexStr = hexStr.replace(/\s/g, '');
            let [r, g, b, a] = [0, 0, 0, 0];
            if (hexStr.length < 6) {
                [, r, g, b, a] = Util.deHex(hexStr.match(/#([0-9A-F])([0-9A-F])([0-9A-F])([0-9A-F])*/i));
                if (Number.isNaN(a)) a = COL_Interval;
                return new Color(r * 16, g * 16, b * 16, a * 16);
            } else {
                [, r, g, b, a] = Util.deHex(hexStr.match(/#([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])*/i));
                if (Number.isNaN(a)) a = COL_RGBMax;
                return new Color(r, g, b, a);
            }
        }
        static fromRGB(rgbString) {
            rgbString = rgbString.replace(/\s/g, '');
            let [r, g, b, a] = [0, 0, 0, 0];
            if (rgbString.substr(0, 4) === "rgba") {
                [, r, g, b, a] = rgbString.match(/rgba\((\d+),(\d+),(\d+),([\d\.]+)\)/i);
            } else {
                [, r, g, b, a] = rgbString.match(/rgb\((\d+),(\d+),(\d+)\)/i);
            }
            if (Number.isNaN(a) || a === undefined) a = 1;
            return new Color(r, g, b, a);
        }
        static fromHSL(hslStr) {
            const rgbStr = Util.toRGB(hslStr);
            return Color.fromRGB(rgbStr);
        }
        static fromHSB(hsbStr) {
            const rgbStr = Util.toRGB(hsbStr);
            return Color.fromRGB(rgbStr);
        }
        static fromColorString(colStr) {
            const rgbStr = Util.toRGB(colStr);
            return Color.fromRGB(rgbStr);
        }
        static random() {
            return new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255, Math.random() * 255);
        }




        //class functions
        toString(type = "NONE") {
            switch (type.toUpperCase()) {
                case "HEX":
                    if (this._a != 1) {
                        return `#${Util.hex(this._r)}${Util.hex(this._g)}${Util.hex(this._b)}${Util.hex(Math.round(this._a * 255))}`;
                    } else {
                        return `#${Util.hex(this._r)}${Util.hex(this._g)}${Util.hex(this._b)}`;
                    }
                default:
                    if (this._a != 1) {
                        return `rgba(${this._r},${this._g},${this._b},${this._a})`;
                    } else {
                        return `rgb(${this._r},${this._g},${this._b})`;
                    }
            }
        }
        r(value) {
            return new Color(value, this._g, this._b, this._a);
        }
        g(value) {
            return new Color(this._r, value, this._b, this._a);
        }
        b(value) {
            return new Color(this._r, this._g, value, this._a);
        }
        a(value) {
            return new Color(this._r, this._g, this._b, value);
        }
        mix(other, percent) {
            return new Color(
                Util.lerpNumber(this._r, other._r, percent),
                Util.lerpNumber(this._g, other._g, percent),
                Util.lerpNumber(this._b, other._b, percent),
                Util.lerpNumber(this._r, other._a, percent))
        }
        luminance(percent) {
            percent /= 100;
            return new Color(
                Math.round(Math.min(Math.max(0, this._r + (this._r * percent)), 255)),
                Math.round(Math.min(Math.max(0, this._g + (this._g * percent)), 255)),
                Math.round(Math.min(Math.max(0, this._b + (this._b * percent)), 255)),
                this._a
            );
        }
        darken(percent) {
            return this.luminance(-percent);
        }
        lighten(percent) {
            return this.luminance(percent);//alias for luminance;
        }
        grayscale() {
            let avg = (this._r + this._b + this._g) / 3;
            return new Color(avg, avg, avg, this._a);
        }
        invert() {
            return new Color(255 - this._r, 255 - this._g, 255 - this._b, this._a);
        }


        //non chainable methods
        red() {
            return this._r;
        }
        green() {
            return this._g;
        }
        blue() {
            return this._b;
        }
        alpha() {
            return this._a;
        }
    }
    exports = Color;
    return exports.Color;
})(exports);