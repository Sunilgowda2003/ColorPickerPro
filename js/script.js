// ============================================
// COLORPICKER PRO - JAVASCRIPT
// ============================================

// DOM ELEMENTS

const colorInput = document.getElementById("colorInput");
const colorPreview = document.getElementById("colorPreview");
const previewHex = document.getElementById("previewHex");
const selectedHex = document.getElementById("selectedHex");

const hexValue = document.getElementById("hexValue");
const rgbValue = document.getElementById("rgbValue");
const hslValue = document.getElementById("hslValue");

const randomBtn = document.getElementById("randomBtn");
const resetBtn = document.getElementById("resetBtn");

const favoriteBtn = document.getElementById("favoriteBtn");
const favoritesContainer = document.getElementById("favoritesContainer");

const historyContainer = document.getElementById("historyContainer");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const gradientColor1 = document.getElementById("gradientColor1");
const gradientColor2 = document.getElementById("gradientColor2");
const gradientDirection = document.getElementById("gradientDirection");

const gradientPreview = document.getElementById("gradientPreview");
const gradientCode = document.getElementById("gradientCode");
const copyGradientBtn = document.getElementById("copyGradientBtn");

const toast = document.getElementById("toast");

const DEFAULT_COLOR = "#6C63FF";

let currentColor = DEFAULT_COLOR;

let colorHistory = loadData("colorHistory", []);
let favoriteColors = loadData("favoriteColors", []);


// ============================================
// LOCAL STORAGE
// ============================================

function loadData(key, fallback) {
    try {
        const savedData = localStorage.getItem(key);

        if (savedData === null) {
            return fallback;
        }

        const parsedData = JSON.parse(savedData);

        return Array.isArray(parsedData) ? parsedData : fallback;

    } catch (error) {
        console.error("Unable to load data:", error);
        return fallback;
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error("Unable to save data:", error);
    }
}


// ============================================
// COLOR CONVERSIONS
// ============================================

function hexToRgb(hex) {
    const cleanHex = hex.replace("#", "");

    return {
        r: parseInt(cleanHex.substring(0, 2), 16),
        g: parseInt(cleanHex.substring(2, 4), 16),
        b: parseInt(cleanHex.substring(4, 6), 16)
    };
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = 0;
    let s = 0;

    const l = (max + min) / 2;

    if (max !== min) {
        const difference = max - min;

        s = l > 0.5
            ? difference / (2 - max - min)
            : difference / (max + min);

        switch (max) {
            case r:
                h = (g - b) / difference + (g < b ? 6 : 0);
                break;

            case g:
                h = (b - r) / difference + 2;
                break;

            case b:
                h = (r - g) / difference + 4;
                break;
        }

        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}


// ============================================
// UPDATE COLOR
// ============================================

function updateColor(color, addToHistory = true) {
    currentColor = color.toUpperCase();

    const rgb = hexToRgb(currentColor);

    const hsl = rgbToHsl(
        rgb.r,
        rgb.g,
        rgb.b
    );

    colorPreview.style.backgroundColor = currentColor;

    previewHex.textContent = currentColor;
    selectedHex.textContent = currentColor;

    hexValue.textContent = currentColor;

    rgbValue.textContent =
        `${rgb.r}, ${rgb.g}, ${rgb.b}`;

    hslValue.textContent =
        `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;

    colorInput.value = currentColor.toLowerCase();

    updateFavoriteButton();

    if (addToHistory) {
        addColorToHistory(currentColor);
    }
}


// ============================================
// COLOR INPUT
// ============================================

colorInput.addEventListener("input", event => {
    updateColor(event.target.value);
});


// ============================================
// RANDOM COLOR GENERATOR
// ============================================

function generateRandomColor() {
    const characters = "0123456789ABCDEF";

    let color = "#";

    for (let i = 0; i < 6; i++) {
        color += characters[
            Math.floor(Math.random() * 16)
        ];
    }

    return color;
}

randomBtn.addEventListener("click", () => {
    updateColor(generateRandomColor());
});


// ============================================
// CLIPBOARD
// ============================================

async function copyText(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement("textarea");

            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.select();

            const copied = document.execCommand("copy");

            textarea.remove();

            if (!copied) {
                throw new Error("Copy failed");
            }
        }

        showToast("Copied successfully!");

    } catch (error) {
        console.error(error);
        showToast("Unable to copy");
    }
}

document.querySelectorAll(".copy-btn").forEach(button => {
    button.addEventListener("click", () => {
        const elementId = button.dataset.copy;

        const value = document.getElementById(
            elementId
        ).textContent;

        copyText(value);
    });
});


// ============================================
// TOAST
// ============================================

let toastTimeout;

function showToast(message) {
    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


// ============================================
// COLOR HISTORY
// ============================================

function addColorToHistory(color) {
    colorHistory = colorHistory.filter(
        item => item !== color
    );

    colorHistory.unshift(color);

    colorHistory = colorHistory.slice(0, 12);

    saveData("colorHistory", colorHistory);

    renderHistory();
}

function createSwatch(color, type, index) {
    const item = document.createElement("div");

    item.className = "swatch-item";

    const swatch = document.createElement("button");

    swatch.className = "swatch";
    swatch.type = "button";
    swatch.style.backgroundColor = color;
    swatch.title = `Select ${color}`;

    swatch.addEventListener("click", () => {
        updateColor(color);
    });

    const colorCode = document.createElement("p");

    colorCode.textContent = color;

    item.appendChild(swatch);
    item.appendChild(colorCode);

    if (type === "favorite") {
        const removeButton = document.createElement("button");

        removeButton.className = "swatch-remove";
        removeButton.textContent = "×";
        removeButton.type = "button";

        removeButton.addEventListener("click", () => {
            removeFavorite(index);
        });

        item.appendChild(removeButton);
    }

    return item;
}

function renderHistory() {
    historyContainer.innerHTML = "";

    if (colorHistory.length === 0) {
        const message = document.createElement("p");

        message.className = "empty-message";
        message.textContent = "No recent colors yet.";

        historyContainer.appendChild(message);

        return;
    }

    colorHistory.forEach((color, index) => {
        historyContainer.appendChild(
            createSwatch(color, "history", index)
        );
    });
}

clearHistoryBtn.addEventListener("click", () => {
    colorHistory = [];

    saveData("colorHistory", colorHistory);

    renderHistory();

    showToast("Color history cleared");
});


// ============================================
// FAVORITES
// ============================================

function updateFavoriteButton() {
    const isFavorite = favoriteColors.includes(currentColor);

    favoriteBtn.textContent = isFavorite
        ? "♥ Saved Favorite"
        : "♡ Save Favorite";
}

favoriteBtn.addEventListener("click", () => {
    if (favoriteColors.includes(currentColor)) {
        favoriteColors = favoriteColors.filter(
            color => color !== currentColor
        );

        showToast("Removed from favorites");

    } else {
        favoriteColors.push(currentColor);

        showToast("Added to favorites");
    }

    saveData("favoriteColors", favoriteColors);

    renderFavorites();

    updateFavoriteButton();
});

function renderFavorites() {
    favoritesContainer.innerHTML = "";

    if (favoriteColors.length === 0) {
        const message = document.createElement("p");

        message.className = "empty-message";
        message.textContent = "No favorite colors saved yet.";

        favoritesContainer.appendChild(message);

        return;
    }

    favoriteColors.forEach((color, index) => {
        favoritesContainer.appendChild(
            createSwatch(color, "favorite", index)
        );
    });
}

function removeFavorite(index) {
    favoriteColors.splice(index, 1);

    saveData("favoriteColors", favoriteColors);

    renderFavorites();

    updateFavoriteButton();

    showToast("Favorite removed");
}


// ============================================
// GRADIENT GENERATOR
// ============================================

function updateGradient() {
    const color1 = gradientColor1.value.toUpperCase();
    const color2 = gradientColor2.value.toUpperCase();
    const direction = gradientDirection.value;

    const gradient =
        `linear-gradient(${direction}, ${color1}, ${color2})`;

    gradientPreview.style.background = gradient;

    gradientCode.textContent = gradient + ";";
}

gradientColor1.addEventListener("input", updateGradient);
gradientColor2.addEventListener("input", updateGradient);
gradientDirection.addEventListener("change", updateGradient);

copyGradientBtn.addEventListener("click", () => {
    copyText(`background: ${gradientCode.textContent}`);
});


// ============================================
// RESET
// ============================================

resetBtn.addEventListener("click", () => {
    updateColor(DEFAULT_COLOR);

    showToast("Color reset successfully");
});


// ============================================
// PALETTE GENERATOR
// ============================================

const generatePaletteBtn =
    document.getElementById("generatePaletteBtn");

const paletteType =
    document.getElementById("paletteType");

const paletteContainer =
    document.getElementById("paletteContainer");

const copyPaletteBtn =
    document.getElementById("copyPaletteBtn");

let generatedPalette = [];

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;

    const a = s * Math.min(l, 1 - l);

    const f = n => {
        const color = l - a * Math.max(
            -1,
            Math.min(k(n) - 3, 9 - k(n), 1)
        );

        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0");
    };

    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function generatePalette() {
    const rgb = hexToRgb(currentColor);

    const hsl = rgbToHsl(
        rgb.r,
        rgb.g,
        rgb.b
    );

    const hue = hsl.h;
    const saturation = hsl.s;
    const lightness = hsl.l;

    let hues = [];

    switch (paletteType.value) {
        case "complementary":
            hues = [
                hue,
                hue + 180,
                hue + 30,
                hue + 210,
                hue + 90
            ];
            break;

        case "analogous":
            hues = [
                hue - 40,
                hue - 20,
                hue,
                hue + 20,
                hue + 40
            ];
            break;

        case "triadic":
            hues = [
                hue,
                hue + 120,
                hue + 240,
                hue + 60,
                hue + 180
            ];
            break;

        case "monochromatic":
            generatedPalette = [
                hslToHex(hue, saturation, 20),
                hslToHex(hue, saturation, 35),
                hslToHex(hue, saturation, 50),
                hslToHex(hue, saturation, 65),
                hslToHex(hue, saturation, 80)
            ];

            renderPalette();

            return;
    }

    generatedPalette = hues.map((newHue, index) => {
        const adjustedHue =
            ((newHue % 360) + 360) % 360;

        const adjustedLightness = Math.max(
            20,
            Math.min(80, lightness + (index - 2) * 5)
        );

        return hslToHex(
            adjustedHue,
            saturation,
            adjustedLightness
        );
    });

    renderPalette();
}

function renderPalette() {
    paletteContainer.innerHTML = "";

    generatedPalette.forEach(color => {
        const card = document.createElement("div");

        card.className = "palette-color";

        const preview = document.createElement("div");

        preview.className = "palette-color-preview";
        preview.style.backgroundColor = color;

        const code = document.createElement("div");

        code.className = "palette-color-code";
        code.textContent = color;

        card.appendChild(preview);
        card.appendChild(code);

        card.addEventListener("click", () => {
            updateColor(color);

            showToast(`${color} selected`);
        });

        paletteContainer.appendChild(card);
    });
}

generatePaletteBtn.addEventListener("click", generatePalette);

paletteType.addEventListener("change", generatePalette);

copyPaletteBtn.addEventListener("click", () => {
    if (generatedPalette.length === 0) {
        showToast("Generate a palette first");
        return;
    }

    copyText(generatedPalette.join(", "));
});


// ============================================
// CONTRAST CHECKER
// ============================================

const foregroundColor =
    document.getElementById("foregroundColor");

const backgroundColor =
    document.getElementById("backgroundColor");

const contrastPreview =
    document.getElementById("contrastPreview");

const contrastRatio =
    document.getElementById("contrastRatio");

const contrastStatus =
    document.getElementById("contrastStatus");

function getLuminance(hex) {
    const rgb = hexToRgb(hex);

    const channels = [
        rgb.r,
        rgb.g,
        rgb.b
    ].map(value => {
        value /= 255;

        return value <= 0.04045
            ? value / 12.92
            : Math.pow(
                (value + 0.055) / 1.055,
                2.4
            );
    });

    return (
        0.2126 * channels[0] +
        0.7152 * channels[1] +
        0.0722 * channels[2]
    );
}

function calculateContrast(color1, color2) {
    const luminance1 = getLuminance(color1);
    const luminance2 = getLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
}

function updateContrast() {
    const textColor = foregroundColor.value;
    const bgColor = backgroundColor.value;

    const ratio = calculateContrast(
        textColor,
        bgColor
    );

    contrastPreview.style.color = textColor;
    contrastPreview.style.backgroundColor = bgColor;

    contrastRatio.textContent =
        `${ratio.toFixed(2)}:1`;

    if (ratio >= 7) {
        contrastStatus.textContent = "AAA - Excellent";
        contrastStatus.className = "contrast-status pass";

    } else if (ratio >= 4.5) {
        contrastStatus.textContent = "AA - Pass";
        contrastStatus.className = "contrast-status pass";

    } else if (ratio >= 3) {
        contrastStatus.textContent = "AA Large Text Only";
        contrastStatus.className = "contrast-status warning";

    } else {
        contrastStatus.textContent = "Fail - Low Contrast";
        contrastStatus.className = "contrast-status fail";
    }
}

foregroundColor.addEventListener("input", updateContrast);
backgroundColor.addEventListener("input", updateContrast);


// ============================================
// FAST INTERACTIVE COLOR WHEEL
// ============================================

(() => {
    const canvas = document.getElementById("colorWheel");
    const colorInput = document.getElementById("colorInput");
    const brightnessSlider = document.getElementById("wheelBrightness");

    if (!canvas || !colorInput || !brightnessSlider) {
        return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });

    const wheelColorPreview =
        document.getElementById("wheelColorPreview");

    const wheelColorHex =
        document.getElementById("wheelColorHex");

    const brightnessValue =
        document.getElementById("brightnessValue");

    const width = canvas.width;
    const height = canvas.height;

    const centerX = width / 2;
    const centerY = height / 2;

    const radius = Math.min(centerX, centerY) - 5;

    let hue = 244;
    let saturation = 0.61;
    let brightness = 1;

    let isDragging = false;

    let wheelImage = null;
    let wheelImageDirty = true;

    let pendingPointer = null;
    let pointerFrame = 0;


    // HSV TO RGB

    function hsvToRgb(h, s, v) {
        const c = v * s;

        const x = c * (
            1 - Math.abs((h / 60) % 2 - 1)
        );

        const m = v - c;

        let r = 0;
        let g = 0;
        let b = 0;

        if (h < 60) {
            [r, g, b] = [c, x, 0];

        } else if (h < 120) {
            [r, g, b] = [x, c, 0];

        } else if (h < 180) {
            [r, g, b] = [0, c, x];

        } else if (h < 240) {
            [r, g, b] = [0, x, c];

        } else if (h < 300) {
            [r, g, b] = [x, 0, c];

        } else {
            [r, g, b] = [c, 0, x];
        }

        return [
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        ];
    }


    // RGB TO HEX

    function rgbToHex(r, g, b) {
        return "#" + [r, g, b]
            .map(value =>
                value.toString(16).padStart(2, "0")
            )
            .join("")
            .toUpperCase();
    }


    // HEX TO HSV

    function hexToHsv(hex) {
        const value = hex.replace("#", "");

        const r = parseInt(value.slice(0, 2), 16) / 255;
        const g = parseInt(value.slice(2, 4), 16) / 255;
        const b = parseInt(value.slice(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);

        const delta = max - min;

        let h = 0;

        if (delta !== 0) {
            if (max === r) {
                h = 60 * (((g - b) / delta) % 6);

            } else if (max === g) {
                h = 60 * ((b - r) / delta + 2);

            } else {
                h = 60 * ((r - g) / delta + 4);
            }
        }

        if (h < 0) {
            h += 360;
        }

        return {
            h,
            s: max === 0 ? 0 : delta / max,
            v: max
        };
    }


    // DRAW WHEEL PIXELS ONLY WHEN NECESSARY

    function createWheelImage() {
        const imageData = ctx.createImageData(width, height);

        const data = imageData.data;

        for (let y = 0; y < height; y++) {
            const dy = y - centerY;

            for (let x = 0; x < width; x++) {
                const dx = x - centerX;

                const distance = Math.sqrt(
                    dx * dx + dy * dy
                );

                const index = (y * width + x) * 4;

                if (distance <= radius) {
                    let pixelHue =
                        Math.atan2(dy, dx) * 180 / Math.PI;

                    pixelHue = (pixelHue + 360) % 360;

                    const pixelSaturation =
                        Math.min(distance / radius, 1);

                    const [r, g, b] = hsvToRgb(
                        pixelHue,
                        pixelSaturation,
                        brightness
                    );

                    data[index] = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                    data[index + 3] = 255;

                } else {
                    data[index + 3] = 0;
                }
            }
        }

        wheelImage = imageData;

        wheelImageDirty = false;
    }


    // DRAW SELECTION MARKER

    function drawMarker() {
        const angle = hue * Math.PI / 180;

        const distance = saturation * radius;

        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        ctx.beginPath();

        ctx.arc(x, y, 9, 0, Math.PI * 2);

        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 4;

        ctx.stroke();

        ctx.beginPath();

        ctx.arc(x, y, 9, 0, Math.PI * 2);

        ctx.strokeStyle = "#20243A";
        ctx.lineWidth = 1.5;

        ctx.stroke();
    }


    // RENDER WHEEL

    function renderWheel() {
        if (wheelImageDirty || !wheelImage) {
            createWheelImage();
        }

        ctx.putImageData(wheelImage, 0, 0);

        drawMarker();
    }


    // UPDATE COLOR FROM WHEEL

    function syncWheelColor({ redraw = true } = {}) {
        const [r, g, b] = hsvToRgb(
            hue,
            saturation,
            brightness
        );

        const hex = rgbToHex(r, g, b);

        if (colorInput.value.toUpperCase() !== hex) {
            colorInput.value = hex.toLowerCase();
        }

        updateColor(hex, false);

        if (wheelColorPreview) {
            wheelColorPreview.style.backgroundColor = hex;
        }

        if (wheelColorHex) {
            wheelColorHex.textContent = hex;
        }

        if (brightnessValue) {
            brightnessValue.textContent =
                `${Math.round(brightness * 100)}%`;
        }

        if (redraw) {
            renderWheel();
        }
    }


    // HANDLE POINTER

    function handleWheelPointer(event) {
        const rect = canvas.getBoundingClientRect();

        const x =
            (event.clientX - rect.left) *
            (width / rect.width);

        const y =
            (event.clientY - rect.top) *
            (height / rect.height);

        const dx = x - centerX;
        const dy = y - centerY;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );

        if (distance > radius) {
            return;
        }

        hue =
            (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;

        saturation = Math.min(
            distance / radius,
            1
        );

        syncWheelColor({ redraw: true });
    }


    // FRAME-SYNCHRONIZED POINTER UPDATE

    function schedulePointerUpdate(event) {
        pendingPointer = event;

        if (pointerFrame) {
            return;
        }

        pointerFrame = requestAnimationFrame(() => {
            pointerFrame = 0;

            if (pendingPointer) {
                handleWheelPointer(pendingPointer);
            }

            pendingPointer = null;
        });
    }


    // POINTER DOWN

    canvas.addEventListener("pointerdown", event => {
        isDragging = true;

        canvas.setPointerCapture(event.pointerId);

        schedulePointerUpdate(event);
    });


    // POINTER MOVE

    canvas.addEventListener("pointermove", event => {
        if (isDragging) {
            schedulePointerUpdate(event);
        }
    });


    // STOP DRAGGING

    function stopDragging() {
        isDragging = false;

        pendingPointer = null;

        if (pointerFrame) {
            cancelAnimationFrame(pointerFrame);

            pointerFrame = 0;
        }
    }

    canvas.addEventListener("pointerup", () => {
        stopDragging();

        if (typeof addColorToHistory === "function") {
            addColorToHistory(currentColor);
        }
    });

    canvas.addEventListener("pointercancel", stopDragging);

    canvas.addEventListener(
        "lostpointercapture",
        stopDragging
    );


    // BRIGHTNESS CONTROL

    brightnessSlider.addEventListener("input", () => {
        brightness =
            Number(brightnessSlider.value) / 100;

        wheelImageDirty = true;

        syncWheelColor({ redraw: true });
    });

    brightnessSlider.addEventListener("change", () => {
        if (typeof addColorToHistory === "function") {
            addColorToHistory(currentColor);
        }
    });


    // SYNC COLOR INPUT AND WHEEL

    colorInput.addEventListener("input", () => {
        const hsv = hexToHsv(colorInput.value);

        hue = hsv.h;
        saturation = hsv.s;
        brightness = hsv.v;

        brightnessSlider.value =
            Math.round(brightness * 100);

        brightnessValue.textContent =
            `${brightnessSlider.value}%`;

        wheelImageDirty = true;

        renderWheel();

        if (wheelColorPreview) {
            wheelColorPreview.style.backgroundColor =
                colorInput.value;
        }

        if (wheelColorHex) {
            wheelColorHex.textContent =
                colorInput.value.toUpperCase();
        }
    });


    // INITIALIZE WHEEL

    const initial = hexToHsv(
        colorInput.value || DEFAULT_COLOR
    );

    hue = initial.h;
    saturation = initial.s;
    brightness = initial.v;

    brightnessSlider.value =
        Math.round(brightness * 100);

    brightnessValue.textContent =
        `${brightnessSlider.value}%`;

    wheelImageDirty = true;

    renderWheel();

    if (wheelColorPreview) {
        wheelColorPreview.style.backgroundColor =
            colorInput.value;
    }

    if (wheelColorHex) {
        wheelColorHex.textContent =
            colorInput.value.toUpperCase();
    }

})();


// ============================================
// INITIALIZE APPLICATION
// ============================================

function initializeApp() {
    updateColor(DEFAULT_COLOR, false);

    renderHistory();

    renderFavorites();

    updateGradient();

    updateFavoriteButton();

    generatePalette();

    updateContrast();

    console.log("ColorPicker Pro initialized!");
}

initializeApp();

// =========================
// DARK / LIGHT THEME TOGGLE
// =========================

function initializeTheme() {
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const themeText = document.getElementById("themeText");

    if (!themeToggle) return;

    const savedTheme = localStorage.getItem("colorPickerTheme");

    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    }

    updateThemeButton();

    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("light-theme");

        const isLightTheme =
            document.body.classList.contains("light-theme");

        localStorage.setItem(
            "colorPickerTheme",
            isLightTheme ? "light" : "dark"
        );

        updateThemeButton();
    });

    function updateThemeButton() {
        const isLightTheme =
            document.body.classList.contains("light-theme");

        if (themeIcon) {
            themeIcon.textContent = isLightTheme ? "☀️" : "🌙";
        }

        if (themeText) {
            themeText.textContent = isLightTheme
                ? "Light Mode"
                : "Dark Mode";
        }

        themeToggle.setAttribute(
            "aria-label",
            isLightTheme
                ? "Switch to dark theme"
                : "Switch to light theme"
        );
    }
}

initializeTheme();

// =========================
// EXPORT COLOR PALETTE
// =========================

function getExportColors() {
    const colors = [];

    // Include current selected color
    const colorInput = document.getElementById("colorInput");

    if (colorInput && colorInput.value) {
        colors.push(colorInput.value.toUpperCase());
    }

    // Include favorite colors from rendered swatches
    const favoritesContainer = document.getElementById("favoritesContainer");

    if (favoritesContainer) {
        const swatches = favoritesContainer.querySelectorAll(
            "[data-color], [data-hex], .swatch, .color-swatch"
        );

        swatches.forEach((swatch) => {
            let color =
                swatch.dataset.color ||
                swatch.dataset.hex ||
                swatch.style.backgroundColor;

            if (color && color.startsWith("#")) {
                colors.push(color.toUpperCase());
            }
        });
    }

    // Remove duplicates
    return [...new Set(colors)];
}

function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

// Export as CSS
document.getElementById("exportCssBtn")?.addEventListener("click", () => {
    const colors = getExportColors();

    const css = `:root {\n${colors
        .map((color, index) => `    --color-${index + 1}: ${color};`)
        .join("\n")}\n}`;

    downloadFile("color-palette.css", css, "text/css");

    if (typeof showToast === "function") {
        showToast("CSS palette exported successfully!");
    }
});

// Export as JSON
document.getElementById("exportJsonBtn")?.addEventListener("click", () => {
    const colors = getExportColors();

    const json = JSON.stringify(
        {
            paletteName: "ColorPicker Pro Palette",
            colors: colors
        },
        null,
        4
    );

    downloadFile("color-palette.json", json, "application/json");

    if (typeof showToast === "function") {
        showToast("JSON palette exported successfully!");
    }
});