export interface QuizOption {
    label: string
    value: string
    scores: Record<string, number> // productId -> score
}

export interface QuizQuestion {
    id: string
    text: string
    options: QuizOption[]
}

export const PRODUCT_IDS = {
    CHAOS: 'ring-001',
    DIGITAL_DETOX: 'ring-002',
    MAIN_CHARACTER: 'ring-003',
    SOFT_LAUNCH: 'ring-004',
    GLOW_UP: 'ring-005',
    PLANT_PARENT: 'ring-006',
    SIDE_QUEST: 'ring-007',
    NO_FILTER: 'ring-008',
}

export const quizQuestions: QuizQuestion[] = [
    {
        id: 'q1',
        text: "It's Saturday morning. What's the vibe?",
        options: [
            {
                label: 'A chaotic espresso run in oversized sunglasses.',
                value: 'chaos',
                scores: { [PRODUCT_IDS.CHAOS]: 3, [PRODUCT_IDS.MAIN_CHARACTER]: 1 },
            },
            {
                label: 'Watering my 47 plants while listening to ambient synth.',
                value: 'plants',
                scores: { [PRODUCT_IDS.PLANT_PARENT]: 3, [PRODUCT_IDS.DIGITAL_DETOX]: 1 },
            },
            {
                label: 'Hiking a trail I found on a map from 1999.',
                value: 'adventure',
                scores: { [PRODUCT_IDS.SIDE_QUEST]: 3, [PRODUCT_IDS.NO_FILTER]: 1 },
            },
            {
                label: 'Editing content for my secret aesthetic account.',
                value: 'content',
                scores: { [PRODUCT_IDS.GLOW_UP]: 2, [PRODUCT_IDS.MAIN_CHARACTER]: 2 },
            },
        ],
    },
    {
        id: 'q2',
        text: "Pick a texture that speaks to you.",
        options: [
            {
                label: 'Raw, unpolished stone.',
                value: 'raw',
                scores: { [PRODUCT_IDS.NO_FILTER]: 3, [PRODUCT_IDS.CHAOS]: 1 },
            },
            {
                label: 'Sleek, futuristic metal.',
                value: 'sleek',
                scores: { [PRODUCT_IDS.DIGITAL_DETOX]: 3, [PRODUCT_IDS.SOFT_LAUNCH]: 1 },
            },
            {
                label: 'Something that shifts color in the light.',
                value: 'iridescent',
                scores: { [PRODUCT_IDS.GLOW_UP]: 3, [PRODUCT_IDS.CHAOS]: 1 },
            },
            {
                label: 'Organic, vine-like twists.',
                value: 'organic',
                scores: { [PRODUCT_IDS.PLANT_PARENT]: 3, [PRODUCT_IDS.SIDE_QUEST]: 1 },
            },
        ],
    },
    {
        id: 'q3',
        text: "What's your relationship status with your phone?",
        options: [
            {
                label: 'Locked in a drawer. I need peace.',
                value: 'disconnect',
                scores: { [PRODUCT_IDS.DIGITAL_DETOX]: 3, [PRODUCT_IDS.NO_FILTER]: 1 },
            },
            {
                label: 'It’s my creative tool. I’m broadcasting.',
                value: 'broadcast',
                scores: { [PRODUCT_IDS.MAIN_CHARACTER]: 3, [PRODUCT_IDS.GLOW_UP]: 1 },
            },
            {
                label: 'I use it to document rare moments.',
                value: 'document',
                scores: { [PRODUCT_IDS.SIDE_QUEST]: 2, [PRODUCT_IDS.SOFT_LAUNCH]: 1 },
            },
            {
                label: 'It’s complicated.',
                value: 'complicated',
                scores: { [PRODUCT_IDS.CHAOS]: 2, [PRODUCT_IDS.GLOW_UP]: 1 },
            },
        ],
    },
    {
        id: 'q4',
        text: "Choose a power word.",
        options: [
            {
                label: 'Growth.',
                value: 'growth',
                scores: { [PRODUCT_IDS.PLANT_PARENT]: 2, [PRODUCT_IDS.GLOW_UP]: 2 },
            },
            {
                label: 'Authenticity.',
                value: 'authenticity',
                scores: { [PRODUCT_IDS.NO_FILTER]: 3, [PRODUCT_IDS.DIGITAL_DETOX]: 1 },
            },
            {
                label: 'Intimacy.',
                value: 'intimacy',
                scores: { [PRODUCT_IDS.SOFT_LAUNCH]: 3, [PRODUCT_IDS.SIDE_QUEST]: 1 },
            },
            {
                label: 'Impact.',
                value: 'impact',
                scores: { [PRODUCT_IDS.MAIN_CHARACTER]: 3, [PRODUCT_IDS.CHAOS]: 1 },
            },
        ],
    },
    {
        id: 'q5',
        text: "Your outfit isn't complete without...",
        options: [
            {
                label: 'A statement piece that starts conversations.',
                value: 'statement',
                scores: { [PRODUCT_IDS.CHAOS]: 2, [PRODUCT_IDS.MAIN_CHARACTER]: 2 },
            },
            {
                label: 'Something subtle only I know the meaning of.',
                value: 'subtle',
                scores: { [PRODUCT_IDS.SOFT_LAUNCH]: 3, [PRODUCT_IDS.DIGITAL_DETOX]: 1 },
            },
            {
                label: 'A stack of memories from my travels.',
                value: 'stack',
                scores: { [PRODUCT_IDS.SIDE_QUEST]: 3, [PRODUCT_IDS.NO_FILTER]: 1 },
            },
            {
                label: 'A pop of unexpected color.',
                value: 'color',
                scores: { [PRODUCT_IDS.GLOW_UP]: 3, [PRODUCT_IDS.PLANT_PARENT]: 1 },
            },
        ],
    },
    {
        id: 'q6',
        text: "Finally, what's your mantra?",
        options: [
            {
                label: 'Embrace the mess.',
                value: 'mess',
                scores: { [PRODUCT_IDS.CHAOS]: 3, [PRODUCT_IDS.NO_FILTER]: 1 },
            },
            {
                label: 'Protect my peace.',
                value: 'peace',
                scores: { [PRODUCT_IDS.DIGITAL_DETOX]: 3, [PRODUCT_IDS.PLANT_PARENT]: 1 },
            },
            {
                label: 'Main. Character. Energy.',
                value: 'mce',
                scores: { [PRODUCT_IDS.MAIN_CHARACTER]: 3, [PRODUCT_IDS.GLOW_UP]: 1 },
            },
            {
                label: 'Keep them guessing.',
                value: 'mystery',
                scores: { [PRODUCT_IDS.SOFT_LAUNCH]: 3, [PRODUCT_IDS.SIDE_QUEST]: 1 },
            },
        ],
    },
]

export function calculateQuizResult(answers: Record<string, string>): string {
    const scores: Record<string, number> = {}

    // Initialize scores
    Object.values(PRODUCT_IDS).forEach((id) => {
        scores[id] = 0
    })

    // Calculate scores
    quizQuestions.forEach((question) => {
        const answerValue = answers[question.id]
        if (answerValue) {
            const selectedOption = question.options.find((opt) => opt.value === answerValue)
            if (selectedOption) {
                Object.entries(selectedOption.scores).forEach(([productId, score]) => {
                    scores[productId] = (scores[productId] || 0) + score
                })
            }
        }
    })

    // Find max score
    let maxScore = -1
    let winningProduct = PRODUCT_IDS.MAIN_CHARACTER // Default

    Object.entries(scores).forEach(([productId, score]) => {
        if (score > maxScore) {
            maxScore = score
            winningProduct = productId
        }
    })

    return winningProduct
}

export const QUIZ_RESULTS: Record<string, any> = {
    [PRODUCT_IDS.CHAOS]: {
        slug: 'cascade-chain',
        name: 'Cascade Chain',
        category: 'Statement',
        price: 1100,
        tone: 'lime',
        tagline: 'Controlled entropy for the beautifully unorganized.',
        heroImage: '/images/catalog/Sora/home/home_hero_shelves.webp', // Fallback
    },
    [PRODUCT_IDS.DIGITAL_DETOX]: {
        slug: 'standard-issue-hoops',
        name: 'Standard Issue Hoops',
        category: 'Essentials',
        price: 350,
        tone: 'volt',
        tagline: 'The baseline protocol. Reliable and classic.',
        heroImage: '/images/catalog/Sora/home/home_collection_everyday_essential_3x2_stone.webp',
    },
    [PRODUCT_IDS.MAIN_CHARACTER]: {
        slug: 'singularity-studs',
        name: 'Singularity Studs',
        category: 'Statement',
        price: 2200,
        tone: 'volt',
        tagline: 'Event horizon. Bends light and attention towards you.',
        heroImage: '/images/products/static/diamond-studs/hero.webp',
    },
    [PRODUCT_IDS.SOFT_LAUNCH]: {
        slug: 'lunar-phase-pendant',
        name: 'Lunar Phase Pendant',
        category: 'Ethereal',
        price: 750,
        tone: 'lime',
        tagline: 'Soft light in the darkness. A quiet reminder.',
        heroImage: '/images/products/static/diamond-pendant/hero.webp',
    },
    [PRODUCT_IDS.GLOW_UP]: {
        slug: 'coral-orbit',
        name: 'Coral Orbit Ring',
        category: 'Statement',
        price: 140, // Verified from DB/Seed
        tone: 'magenta',
        tagline: 'Fluid, constant, and alive. A constant sunset.',
        heroImage: '/images/products/static/three-stone-ring/hero.webp',
    },
    [PRODUCT_IDS.PLANT_PARENT]: {
        slug: 'pearl-logic-drops',
        name: 'Pearl Logic Drops',
        category: 'Ethereal',
        price: 480,
        tone: 'lime',
        tagline: 'Organic data structures. Logic and nature coexisting.',
        heroImage: '/images/catalog/Sora/home/home_collection_Sustainable_3x2_stone.webp',
    },
    [PRODUCT_IDS.SIDE_QUEST]: {
        slug: 'layering-link-stream',
        name: 'Layering Link Stream',
        category: 'Essentials',
        price: 450,
        tone: 'volt',
        tagline: 'The foundation of your stack. Plays well with others.',
        heroImage: '/images/products/static/tennis-necklace/hero.webp',
    },
    [PRODUCT_IDS.NO_FILTER]: {
        slug: 'contrast-hoops',
        name: 'Contrast Hoops',
        category: 'Essentials',
        price: 290,
        tone: 'volt',
        tagline: 'Binary thinking. A study in duality.',
        heroImage: '/images/products/static/halo-diamond-ring/hero.webp',
    },
}
