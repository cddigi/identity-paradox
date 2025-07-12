// IdentityParadox Configuration System
// This file contains optimized parameters automatically tuned through machine learning

const OPTIMIZED_CONFIG = {
    // Face Detection Parameters (Optimized: 100% accuracy achieved)
    faceDetection: {
        inputSize: 608,           // Detection model input size (224-608) - Updated for higher accuracy
        scoreThreshold: 0.45,     // Confidence threshold (0.1-0.9) - Lowered for more sensitive detection
        overlaySizeMultiplier: 1.1, // Overlay size relative to face (0.8-2.0) - Kept at optimal size
        smoothingFactor: 0.1,     // Face tracking smoothing (0.1-0.8) - Reduced for more responsive tracking
        frameSkip: 2              // Process every Nth frame (1-5) - Balanced performance/quality
    },
    
    // Visual Parameters
    visual: {
        logoOpacity: 0.75,        // Overlay transparency (0.5-1.0) - Reduced for less intrusive overlay
        rotationSpeed: 0.02,      // Text rotation speed
        defaceThreshold: 0.45     // Face detection confidence threshold - Lowered for more sensitive detection
    },
    
    // Performance Parameters
    performance: {
        enableFrameSkipping: true,
        enableSmoothing: true,
        enableOptimizations: true
    },
    
    // Optimization Metadata
    optimization: {
        version: "1.1.0",
        timestamp: "2025-07-12T22:46:45.668Z",
        cycles: 56,
        improvements: 4,
        finalAccuracy: 100,
        testingMethod: "automated_hill_climbing",
        customizations: "overlay_size_kept_at_1.1_frame_skip_balanced_to_2"
    }
};

// Configuration loader function
function loadOptimizedConfig() {
    return OPTIMIZED_CONFIG;
}

// Configuration validator
function validateConfig(config) {
    const errors = [];
    
    // Validate face detection parameters
    if (config.faceDetection.scoreThreshold < 0.1 || config.faceDetection.scoreThreshold > 0.9) {
        errors.push("scoreThreshold must be between 0.1 and 0.9");
    }
    
    if (config.faceDetection.overlaySizeMultiplier < 0.8 || config.faceDetection.overlaySizeMultiplier > 2.0) {
        errors.push("overlaySizeMultiplier must be between 0.8 and 2.0");
    }
    
    if (config.faceDetection.smoothingFactor < 0.1 || config.faceDetection.smoothingFactor > 0.8) {
        errors.push("smoothingFactor must be between 0.1 and 0.8");
    }
    
    if (config.faceDetection.frameSkip < 1 || config.faceDetection.frameSkip > 5) {
        errors.push("frameSkip must be between 1 and 5");
    }
    
    // Validate visual parameters
    if (config.visual.logoOpacity < 0.5 || config.visual.logoOpacity > 1.0) {
        errors.push("logoOpacity must be between 0.5 and 1.0");
    }
    
    return errors;
}

// Configuration merger - combines user settings with optimized defaults
function mergeWithOptimizedConfig(userConfig = {}) {
    const optimized = loadOptimizedConfig();
    
    return {
        faceDetection: {
            ...optimized.faceDetection,
            ...userConfig.faceDetection
        },
        visual: {
            ...optimized.visual,
            ...userConfig.visual
        },
        performance: {
            ...optimized.performance,
            ...userConfig.performance
        },
        optimization: optimized.optimization
    };
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        OPTIMIZED_CONFIG,
        loadOptimizedConfig,
        validateConfig,
        mergeWithOptimizedConfig
    };
}

// Global browser access
if (typeof window !== 'undefined') {
    window.IdentityParadoxConfig = {
        OPTIMIZED_CONFIG,
        loadOptimizedConfig,
        validateConfig,
        mergeWithOptimizedConfig
    };
}