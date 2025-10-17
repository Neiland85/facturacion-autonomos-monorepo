"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVoiceRecognition = useVoiceRecognition;
var react_1 = require("react");
function useVoiceRecognition(_a) {
    var _b = _a === void 0 ? {} : _a, onResult = _b.onResult, onError = _b.onError, onStart = _b.onStart, onEnd = _b.onEnd, _c = _b.continuous, continuous = _c === void 0 ? false : _c, _d = _b.interimResults, interimResults = _d === void 0 ? true : _d, _e = _b.lang, lang = _e === void 0 ? "es-ES" : _e;
    var _f = (0, react_1.useState)(""), transcript = _f[0], setTranscript = _f[1];
    var _g = (0, react_1.useState)(false), isListening = _g[0], setIsListening = _g[1];
    var _h = (0, react_1.useState)(null), error = _h[0], setError = _h[1];
    var _j = (0, react_1.useState)(false), hasSupport = _j[0], setHasSupport = _j[1];
    var recognitionRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        // Verificar soporte del navegador
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setHasSupport(true);
            recognitionRef.current = new SpeechRecognition();
            var recognition = recognitionRef.current;
            recognition.continuous = continuous;
            recognition.interimResults = interimResults;
            recognition.lang = lang;
            recognition.onstart = function () {
                setIsListening(true);
                setError(null);
                onStart === null || onStart === void 0 ? void 0 : onStart();
            };
            recognition.onresult = function (event) {
                var finalTranscript = "";
                var interimTranscript = "";
                for (var i = event.resultIndex; i < event.results.length; i++) {
                    var result = event.results[i];
                    if (result === null || result === void 0 ? void 0 : result[0]) {
                        if (result.isFinal) {
                            finalTranscript += result[0].transcript;
                        }
                        else {
                            interimTranscript += result[0].transcript;
                        }
                    }
                }
                var currentTranscript = finalTranscript || interimTranscript;
                setTranscript(currentTranscript);
                if (finalTranscript) {
                    onResult === null || onResult === void 0 ? void 0 : onResult(finalTranscript);
                }
            };
            recognition.onerror = function (event) {
                var errorMessage = getErrorMessage(event.error);
                setError(errorMessage);
                setIsListening(false);
                onError === null || onError === void 0 ? void 0 : onError(errorMessage);
            };
            recognition.onend = function () {
                setIsListening(false);
                onEnd === null || onEnd === void 0 ? void 0 : onEnd();
            };
        }
        else {
            setHasSupport(false);
            setError("El reconocimiento de voz no está soportado en este navegador");
        }
        return function () {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [continuous, interimResults, lang, onResult, onError, onStart, onEnd]);
    var startListening = function () {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            }
            catch (err) {
                setError("Error al iniciar el reconocimiento de voz");
            }
        }
    };
    var stopListening = function () {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };
    var resetTranscript = function () {
        setTranscript("");
        setError(null);
    };
    return {
        transcript: transcript,
        isListening: isListening,
        error: error,
        hasSupport: hasSupport,
        startListening: startListening,
        stopListening: stopListening,
        resetTranscript: resetTranscript,
    };
}
function getErrorMessage(error) {
    switch (error) {
        case "no-speech":
            return "No se detectó habla. Inténtalo de nuevo.";
        case "audio-capture":
            return "Error al capturar audio. Verifica los permisos del micrófono.";
        case "not-allowed":
            return "Acceso al micrófono denegado. Permite el acceso e inténtalo de nuevo.";
        case "network":
            return "Error de red. Verifica tu conexión a internet.";
        case "service-not-allowed":
            return "Servicio de reconocimiento de voz no disponible.";
        case "aborted":
            return "Reconocimiento de voz cancelado.";
        case "language-not-supported":
            return "Idioma no soportado.";
        default:
            return "Error desconocido: ".concat(error);
    }
}
