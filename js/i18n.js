export const dictionary = {
    tc: {
        gameTitle: "洗碗界傳奇",
        stealthToggle: "老闆來了 (Tab)",
        cleanPlates: "已洗淨碗碟",
        bubbleCoins: "氣泡幣",
        rateLabel: "每秒收益:",
        perSec: "/秒",
        foamHeat: "泡沫熱度",
        frenzyMode: "狂暴洗碗模式 3倍收益!",
        tabHelpers: "助手與設備",
        tabVenues: "餐廳經營",
        tabPrestige: "加盟連鎖",
        prestigeTitle: "加盟連鎖事業",
        prestigeDesc: "重置現有進度以換取「黃金海綿」。每塊黃金海綿可永久提升 10% 全局收益！",
        currentSponges: "當前黃金海綿:",
        pendingSponges: "重置可得海綿:",
        prestigeBtn: "立即加盟重置",
        
        // Upgrades
        h1_name: "鋼絲刷",
        h1_desc: "手動去污利器，提升手刷效率。",
        h2_name: "茶餐廳洗碗阿姐",
        h2_desc: "身經百戰，手速驚人的洗碗界主力。",
        h3_name: "高壓噴射水槍",
        h3_desc: "利用強勁水流快速沖走殘渣。",
        h4_name: "商用超聲波洗碗機",
        h4_desc: "利用高頻震盪徹底分解油污。",

        v1_name: "街角茶餐廳",
        v1_desc: "解鎖基本客源與常規碗碟。",
        v2_name: "老字號酒樓",
        v2_desc: "大量點心籠與油膩碗碟等待清理。",
        v3_name: "米芝蓮海鮮酒家",
        v3_desc: "頂級珍饈的高級瓷器，清洗收益極高。",

        toastVip: "VIP 衛生檢查員到訪！20秒內收益翻倍！",
        toastGrease: "警告：油污危機爆發！快點擊油污區！",
        toastPrestige: "成功加盟！獲取了黃金海綿倍率！"
    },
    eng: {
        gameTitle: "Dish Soap Millionaire",
        stealthToggle: "Stealth (Tab)",
        cleanPlates: "Clean Plates",
        bubbleCoins: "Bubble Coins",
        rateLabel: "Earnings:",
        perSec: "/sec",
        foamHeat: "Foam Heat",
        frenzyMode: "FRENZIED SCRUBBING 3X!",
        tabHelpers: "Assistants & Tech",
        tabVenues: "Venues",
        tabPrestige: "Franchise",
        prestigeTitle: "Open Restaurant Chain",
        prestigeDesc: "Reset your progress to earn Gold Sponges. Each Gold Sponge boosts all future production by 10% permanently!",
        currentSponges: "Current Gold Sponges:",
        pendingSponges: "Pending Sponges:",
        prestigeBtn: "Franchise Now",

        // Upgrades
        h1_name: "Steel Wool Scrub",
        h1_desc: "Classic scrubber. Increases manual scrub output.",
        h2_name: "Cha Chaan Teng Auntie",
        h2_desc: "A battle-hardened speed demon of dishwashing.",
        h3_name: "High-Pressure Water Gun",
        h3_desc: "Blast away grease residues effortlessly.",
        h4_name: "Ultrasonic Sonic Washer",
        h4_desc: "Uses soundwaves to instantly vaporize oil.",

        v1_name: "Cha Chaan Teng",
        v1_desc: "Unlocks standard diner dishes and client rate.",
        v2_name: "Dim Sum Palace",
        v2_desc: "Heavy grease steamers yield high rewards.",
        v3_name: "Michelin Seafood",
        v3_desc: "Luxury porcelain cleaning brings top-tier cash.",

        toastVip: "VIP Inspector Visit! Earnings doubled for 20s!",
        toastGrease: "Grease Apocalypse! Clear floating spots fast!",
        toastPrestige: "Franchised successfully! Gold multiplier applied!"
    }
};

export class I18nManager {
    constructor(defaultLang = 'tc') {
        this.lang = defaultLang;
    }

    setLanguage(lang) {
        if (dictionary[lang]) {
            this.lang = lang;
            this.updateDOM();
        }
    }

    t(key) {
        return dictionary[this.lang][key] || key;
    }

    updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dictionary[this.lang][key]) {
                el.textContent = dictionary[this.lang][key];
            }
        });
    }
}