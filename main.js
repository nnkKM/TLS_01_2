/*******************************************************************
 * マップ制御
 * *************************************************************** */
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol('pmtiles', protocol.tile);

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json',
    center: [125.57, -8.56],
    zoom: 8
});
map.addControl(new maplibregl.NavigationControl());


// 最初に地図が読み込まれた時の処理
map.on('load', () => {
    // 主題図を読み込んでいる
    firstSymbolId = getsymbolID();
    addsourcelayers(firstSymbolId, 'migu2m-bold');

    // 人口データのスタイル調整
    updateMapStyle_pop("2020");
    updateMapStyle_popchange("2000", "2020");
    updateMapStyle_LCChangeRate("2000", "2020");

    map.setLayoutProperty('popchange-fill-layer', 'visibility', 'none'); 

});

/*******************************************************************
 * レイヤON/OFF
 * *************************************************************** */
// 人口データと行政界以外のレイヤ設定はjsonのレイヤIDをここに加える
const layerIds = [
    'PublicTransport-points-layer',
];

// population-outline-layer の表示/非表示を制御する関数
const updatePopulationOutlineVisibility = () => {
    // いずれかのレイヤが表示されている場合に population-outline-layer を表示
    const isVisible = document.getElementById('population-all-fill-layer-chk').checked ||
                      document.getElementById('popchange-all-fill-layer-chk').checked ||
                      document.getElementById('LCRPGR-fill-layer-chk').checked;

    map.setLayoutProperty('population-outline-layer', 'visibility', isVisible ? 'visible' : 'none');
};


// 一般レイヤの表示/非表示を切り替える関数
const toggleLayer = (id) => {
    const isChecked = document.getElementById(`${id}-chk`).checked;
    if (isChecked) {
        map.setLayoutProperty(id, 'visibility', 'visible');
    } else {
        map.setLayoutProperty(id, 'visibility', 'none');
    }
};

// 一般レイヤのチェックボックスに変更イベントを追加
layerIds.forEach(lyrId => {
    document.querySelector(`#${lyrId}-chk`).addEventListener('change', () => {
        toggleLayer(lyrId);
    });
});

// 人口データの表示/非表示を切り替える関数
const togglePopulationLayer = (isChecked) => {
    const fillLayerIds = ['population-fill-layer'];
    fillLayerIds.forEach(id => {
        map.setLayoutProperty(id, 'visibility', isChecked ? 'visible' : 'none');
    });
    // population-outline-layer の状態を更新
    updatePopulationOutlineVisibility();
};

const togglePopChangeLayer = (isChecked) => {
    const fillLayerIds = ['popchange-fill-layer'];
    fillLayerIds.forEach(id => {
        map.setLayoutProperty(id, 'visibility', isChecked ? 'visible' : 'none');
    });
    // population-outline-layer の状態を更新
    updatePopulationOutlineVisibility();
};

// 行政界レイヤの表示/非表示を切り替える関数
const toggleOutlineLayer = (isChecked) => {
    const outlineLayerIds = ["Suco-label-layer",'MUNICIPIO-outline-layer', 'PostuAdministrativo-outline-layer', 'Suco-outline-layer'];
    if(isChecked){
        outlineLayerIds.forEach(id => {
            map.setLayoutProperty(id, 'visibility', 'visible');
        });
    }else{
        outlineLayerIds.forEach(id => {
            map.setLayoutProperty(id, 'visibility', 'none');
        });
    }
};

// MicroletRoute-line-layer の表示/非表示を切り替える関数
const toggleMicroletRouteLayer = (isChecked) => {
    const layerIds = ['MicroletRoute-line-layer', 'MicroletRoute-outline-layer'];
    layerIds.forEach(layerId => {
        map.setLayoutProperty(layerId, 'visibility', isChecked ? 'visible' : 'none');
    });
};

// 'LCRPGR-fill-layer' の表示/非表示を切り替える関数
const toggleLCRPGRLayer = (isChecked) => {
    const layerIds = ['LCRPGR-fill-layer'];
    layerIds.forEach(id => {
        map.setLayoutProperty(id, 'visibility', isChecked ? 'visible' : 'none');
    });
    // population-outline-layer の状態を更新
    updatePopulationOutlineVisibility();
};


// PM2.5データの表示/非表示を切り替える関数
const togglePM25Layer = (isChecked) => {
    const fillLayerIds = ['PM25-fill-layer'];
    fillLayerIds.forEach(id => {
        if (isChecked) {
            map.setLayoutProperty(id, 'visibility', 'visible');
        } else {
            map.setLayoutProperty(id, 'visibility', 'none');
        }
    });
};

// 凡例の表示/非表示を切り替える関数
const toggleLegend = () => {
    const legend = document.getElementById('legend');
    if (legend.style.display === 'none') {
        legend.style.display = 'block';
    } else {
        legend.style.display = 'none';
    }
};

// 人口データのレイヤはここで切替
document.querySelector('#population-all-fill-layer-chk').addEventListener('change', () => {
    const isChecked = document.getElementById('population-all-fill-layer-chk').checked;
    togglePopulationLayer(isChecked);
});

document.querySelector('#popchange-all-fill-layer-chk').addEventListener('change', () => {
    const isChecked = document.getElementById('popchange-all-fill-layer-chk').checked;
    togglePopChangeLayer(isChecked);
});

// 行政界レイヤのレイヤはここで切替
document.querySelector('#outline-layer-chk').addEventListener('change', () => {
    const isChecked = document.getElementById('outline-layer-chk').checked;
    toggleOutlineLayer(isChecked);
});

// MicroletRoute-line-layer のチェックボックスに変更イベントを追加
document.querySelector('#MicroletRoute-line-layer-chk').addEventListener('change', () => {
    const isChecked = document.getElementById('MicroletRoute-line-layer-chk').checked;
    toggleMicroletRouteLayer(isChecked);
});

// 'LCRPGR-fill-layer' のチェックボックスに変更イベントを追加
document.querySelector(`#LCRPGR-fill-layer-chk`).addEventListener('change', () => {
    const isChecked = document.getElementById('LCRPGR-fill-layer-chk').checked;
    toggleLCRPGRLayer(isChecked);
});


// PM2.5データのレイヤはここで切替
document.querySelector('#PM25-all-fill-layer-chk').addEventListener('change', () => {
    const isChecked = document.getElementById('PM25-all-fill-layer-chk').checked;
    togglePM25Layer(isChecked);
});

// レイヤのON/OFFイベントをここで一括管理
const setAllLayersAndValues = () => {
    const elm = id => {
        return document.getElementById(id);
    }
    togglePopulationLayer(elm('population-all-fill-layer-chk').checked);
    togglePopChangeLayer(elm('popchange-all-fill-layer-chk').checked);
    toggleOutlineLayer(elm('outline-layer-chk').checked);
    toggleMicroletRouteLayer(elm('MicroletRoute-line-layer-chk').checked); // MicroletRoute の切り替えを追加
    toggleLCRPGRLayer(elm('LCRPGR-fill-layer-chk').checked);
    togglePM25Layer(elm('PM25-all-fill-layer-chk').checked);
    layerIds.forEach(lyrId => {
        toggleLayer(lyrId);
    });

    // population-outline-layer の状態を更新
    updatePopulationOutlineVisibility();

    updateMapStyle_pop(elm('year-slider-pop').value);
    updateMapStyle_popchange(minVal, maxVal);
    updateMapStyle_LCChangeRate(minVal, maxVal);
}

// 凡例の表示・非表示を切り替えるイベントリスナーを追加
document.getElementById('legend-toggle').addEventListener('click', () => {
    toggleLegend();
});


document.querySelector('#toggle-layers-btn').addEventListener('click', () => {
    const layersContainer = document.getElementById('layers-container');
    if (layersContainer.style.display === 'none' || layersContainer.style.display === '') {
        layersContainer.style.display = 'block';
    } else {
        layersContainer.style.display = 'none';
    }
});

// レイヤ階層
document.addEventListener('DOMContentLoaded', () => {
    const sdg1121LayerChk = document.getElementById('sdg1121-layer-chk');
    const sdg1121ToggleBtn = document.getElementById('sdg1121-toggle-btn');
    const sdg1121Layers = document.getElementById('sdg1121-layers');

    const childLayerChks = [
        document.getElementById('population-all-fill-layer-chk'),
        document.getElementById('popchange-all-fill-layer-chk'),
        document.getElementById('PublicTransport-points-layer-chk'),
        document.getElementById('MicroletRoute-line-layer-chk')
    ];

    // 子レイヤの表示/非表示を更新する関数
    const updateChildLayers = (isChecked) => {
        childLayerChks.forEach(chk => {
            if (chk.id !== 'popchange-all-fill-layer-chk') {
                chk.checked = isChecked;
                const layerId = chk.id.replace('-chk', '');
                if (layerId === 'population-all-fill-layer') {
                    togglePopulationLayer(isChecked);
                } else if (layerId === 'popchange-all-fill-layer') {
                    togglePopChangeLayer(isChecked);
                } else if (layerId === 'MicroletRoute-line-layer') {
                    toggleMicroletRouteLayer(isChecked); // MicroletRoute の切り替えを適用
                } else {
                    toggleLayer(layerId);
                }
            }
        });
    };

    // 親レイヤのチェックボックスの動作
    sdg1121LayerChk.addEventListener('change', () => {
        const isChecked = sdg1121LayerChk.checked;
        updateChildLayers(isChecked);
    });

    // トグルボタンの動作
    sdg1121ToggleBtn.addEventListener('click', () => {
        if (sdg1121Layers.style.display === 'none') {
            sdg1121Layers.style.display = 'block';
            sdg1121ToggleBtn.textContent = '▼';
        } else {
            sdg1121Layers.style.display = 'none';
            sdg1121ToggleBtn.textContent = '▶';
        }
    });

    // 子レイヤのチェックボックスが変更されたときの動作
    childLayerChks.forEach(chk => {
        chk.addEventListener('change', () => {
            const layerId = chk.id.replace('-chk', '');
            if (layerId === 'population-all-fill-layer') {
                togglePopulationLayer(chk.checked);
            } else if (layerId === 'popchange-all-fill-layer') {
                togglePopChangeLayer(chk.checked);
            } else if (layerId === 'MicroletRoute-line-layer') {
                toggleMicroletRouteLayer(chk.checked); // MicroletRoute の切り替えを適用
            } else {
                toggleLayer(layerId);
            }
            // 小レイヤのチェック状態に応じて親レイヤのチェックボックスを更新
            sdg1121LayerChk.checked = childLayerChks.some(layerChk => layerChk.checked);
        });
    });
});


///////////////// ラジオボタンによる背景地図ON/OFF /////////////////////////

/* style.jsonがロードされたら発動するレイヤの設定の関数
   style.jsonによって読み込めるfontが違うのでfontを引数にしている
   fontを共通化できたら引数のfontいらない
*/ 
const setLayoutThematicMap = (font) => {
    firstSymbolId = getsymbolID();
    addsourcelayers(firstSymbolId, font);

    // const currentStyle = map.getStyle();
    // console.log('Loaded Style:', currentStyle);
       


}

let tileType = ''; //ラジオボタンを切り替えたときにタイルのタイプを指定
map.on('style.load', function() {   // style.jsonがロードされたとき(setStyle)に発動するイベント
    if(tileType === 'tileservergl'){
        setLayoutThematicMap('migu2m-bold');
        setAllLayersAndValues(); //タイル切り替え前のレイヤの状態に戻すため
    }else if(tileType === 'versatiles'){
		setLayoutThematicMap('noto_sans_regular');
        setAllLayersAndValues(); //タイル切り替え前のレイヤの状態に戻すため
    }else if(tileType === 'osm'){
	setLayoutThematicMap('migu2m-bold');
        setAllLayersAndValues(); //タイル切り替え前のレイヤの状態に戻すため
    }else if(tileType === 'none'){
	setLayoutThematicMap('noto_sans_regular');
        setAllLayersAndValues(); //タイル切り替え前のレイヤの状態に戻すため
    }
    // 他のstyle.jsonを追加するときはここに記述

});

// ラジオボタンの要素を取得
const radioButtons = document.querySelectorAll('input[type=radio][name=mapstyle]');


// 各ラジオボタンにイベントリスナーを設定
radioButtons.forEach(radio => {
    radio.addEventListener('change', function() {
        // ラジオボタンのvalueによってスタイルを変更
        switch(this.value) {
            case 'versatiles':
                // console.log("ラジオボタン押したあああああああああああああああああ");
				map.setStyle('./VersaTiles_Style/style.json')
                tileType = 'versatiles';
                break; //この後、上のmap.on('style.load'～が実行される
            case 'tileservergl':
                // console.log("ラジオボタン押したあああああああああああああああああ");
                map.setStyle('https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json');
                tileType = 'tileservergl';
                break; //この後、上のmap.on('style.load'～が実行される
            case 'osm':
                map.setStyle('./VersaTiles_Style/OSM_style.json')
                tileType = 'osm';
                break;
            case 'none': // 新しい「地図無し」の選択
                map.setStyle('./VersaTiles_Style/empty-style.json')
                tileType = 'none';
                break;
            // 他のstyle.jsonを追加するときはここに記述

        }
    });
});


/*******************************************************************
 * 属性表示
 * *************************************************************** */

//////////////  タッチ操作  /////////////////

let touchStartTime;
let isTouchMove = false;
const longPressDuration = 500; // 長押しと見なす時間（ミリ秒）

map.on('touchstart', handleTouchStart);
map.on('touchmove', handleTouchMove);
map.on('touchend', handleTouchEnd);

function handleTouchStart(e) {
    touchStartTime = Date.now();
    isTouchMove = false; // タッチ開始時にフラグをリセット
}

function handleTouchMove(e) {
    isTouchMove = true; // タッチが移動した場合にフラグをセット
}

function handleTouchEnd(e) {
    const touchDuration = Date.now() - touchStartTime;

    if (isTouchMove) {
        // タッチが移動した場合は何もしない
        return;
    }

    if (touchDuration >= longPressDuration) {
        hideFeatureProperties();
    } else {
        const point = e.point || map.project([e.originalEvent.changedTouches[0].clientX, e.originalEvent.changedTouches[0].clientY]);
        const features = map.queryRenderedFeatures(point);

        if (features.length) {
            const properties = features[0].properties;
            displayFeatureProperties(properties, point);
        }
    }
}

//////////////  クリック操作  /////////////////
map.on('click', (e) => {
    const features = map.queryRenderedFeatures(e.point);

    if (features.length) {
        const properties = features[0].properties;
        displayFeatureProperties(properties, e.point);
    }
});

// 右クリックイベントを追加して属性情報を非表示にする
map.on('contextmenu', (e) => {
    hideFeatureProperties();
});


function displayFeatureProperties(properties, point) {
    const propertiesDisplay = document.getElementById('properties-display');

    // 属性情報をHTMLに変換
    let propertiesHtml = '<table>';
    for (const key in properties) {
        propertiesHtml += `<tr><td><strong>${key}</strong>:</td><td>${properties[key]}</td></tr>`;
    }
    propertiesHtml += '</table>';

    propertiesDisplay.innerHTML = propertiesHtml;
    propertiesDisplay.style.display = 'block';
    propertiesDisplay.style.left = `${point.x + 10}px`;
    propertiesDisplay.style.top = `${point.y + 10}px`;
}

// 属性情報を非表示にする関数
function hideFeatureProperties() {
    const propertiesDisplay = document.getElementById('properties-display');
    propertiesDisplay.style.display = 'none';
}


// 属性情報表示用の要素を追加
const propertiesDisplay = document.createElement('div');
propertiesDisplay.id = 'properties-display';
document.body.appendChild(propertiesDisplay);


/*******************************************************************
 * 年度ごとの表示切替
 * *************************************************************** */

const sliderContainer = document.querySelector('.slider-container');
const sliderRange = document.getElementById('slider-range');
const thumbMin = document.getElementById('thumb-min');
const thumbMax = document.getElementById('thumb-max');
const startValueDisplay = document.getElementById('year-value-popchange');
const endValueDisplay = document.getElementById('end-value');

const minValInitial = 2000;
const maxValInitial = 2020;
const step = 1;

// 現在の値を設定します
let minVal = minValInitial;
let maxVal = maxValInitial;
console.log(minVal, maxVal);

const updateSlider = () => {
    console.log(minVal, maxVal);
    const containerWidth = sliderContainer.offsetWidth;
    const minPos = ((minVal - minValInitial) / (maxValInitial - minValInitial)) * containerWidth;
    const maxPos = ((maxVal - minValInitial) / (maxValInitial - minValInitial)) * containerWidth;

    sliderRange.style.left = minPos + 'px';
    sliderRange.style.width = (maxPos - minPos) + 'px';
    thumbMin.style.left = minPos + 'px';
    thumbMax.style.left = maxPos + 'px';
    yearValuepopchange.textContent = minVal;
    yearValuePopBase.textContent = maxVal;
    yearValueLCRPGR.textContent = minVal;
    yearValueLCRPGRBase.textContent = maxVal;

    updateMapStyle_popchange(minVal, maxVal);
    updateMapStyle_LCChangeRate(minVal, maxVal); 
};

const onMouseMove = (e, thumb) => {
    const containerRect = sliderContainer.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const offsetX = e.clientX - containerRect.left;
    const value = Math.round(minValInitial + ((offsetX / containerWidth) * (maxValInitial - minValInitial)) / step) * step;

    if (thumb === thumbMin) {
        minVal = Math.min(Math.max(value, minValInitial), maxVal - step);
    } else if (thumb === thumbMax) {
        maxVal = Math.max(Math.min(value, maxValInitial), minVal + step);
    }

    updateSlider();
};

thumbMin.addEventListener('mousedown', () => {
    const onMouseMoveMin = (e) => onMouseMove(e, thumbMin);
    window.addEventListener('mousemove', onMouseMoveMin);
    window.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', onMouseMoveMin);
    }, { once: true });
});

thumbMax.addEventListener('mousedown', () => {
    const onMouseMoveMax = (e) => onMouseMove(e, thumbMax);
    window.addEventListener('mousemove', onMouseMoveMax);
    window.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', onMouseMoveMax);
    }, { once: true });
});

// window.addEventListener('load', updateSlider);


/////////////////   スライダーバーの設定　　//////////////////
// 現在の年を保存する変数
let currentYear = 2001;

// スライドバーの要素を取得
const yearSliderPop = document.getElementById('year-slider-pop');
// const yearSliderS = document.getElementById('year-slider-s');
const yearValuePop = document.getElementById('year-value-pop');
// const yearSliderE = document.getElementById('year-slider-e');
const yearValuepopchange = document.getElementById('year-value-popchange');
const yearValueLCRPGR = document.getElementById('year-value-lcrpgr');
const yearValuePopBase = document.getElementById('year-value-popbase'); // 人口ベース年表示
const yearValueLCRPGRBase = document.getElementById('year-value-lcrpgrbase');


// // 人口バー (yearSliderPop) の値が変更された場合
yearSliderPop.addEventListener('input', (event) => {
    const selectedYear = parseInt(event.target.value); // 現在の値を取得
    const barValue = parseInt(yearSliderPop.value); // バーの値を取得

    // バー1がバー2の値を超えないように制約
    if (selectedYear < barValue) {
        yearSliderS.value = barValue; // バー1の値をバー2の値に合わせる
    }

    yearValuePop.textContent = yearSliderPop.value; // 表示を更新
    updateMapStyle_pop(yearSliderPop.value); // 関数を呼び出し
});

// // バー1 (yearSliderS) の値が変更された場合
// yearSliderS.addEventListener('input', (event) => {
//     const selectedYear = parseInt(event.target.value); // 現在の値を取得
//     const bar2Value = parseInt(yearSliderE.value); // バー2の値を取得

//     // バー2がバー1の値を下回らないように制約
//     if (selectedYear > bar2Value) {
//         yearSliderS.value = bar2Value; // バー1の値をバー2の値に合わせる
//     }

//     yearValuepopchange.textContent = yearSliderS.value; // 表示を更新
//     yearValueLCRPGR.textContent = yearSliderS.value; // 他の表示も更新
//     updateMapStyle_popchange(yearSliderS.value, yearSliderE.value); // バー2の関数も更新
//     updateMapStyle_LCChangeRate(yearSliderS.value, yearSliderE.value); 
// });

// // バー2 (yearSliderE) の値が変更された場合
// yearSliderE.addEventListener('input', (event) => {
//     const selectedYear = parseInt(event.target.value); // 現在の値を取得
//     const bar1Value = parseInt(yearSliderS.value); // バー1の値を取得

//     // バー1がバー2の値を超えないように制約
//     if (selectedYear < bar1Value) {
//         yearSliderE.value = bar1Value; // バー2の値をバー1の値に合わせる
//     }

//     yearValuePopBase.textContent = yearSliderE.value;
//     yearValueLCRPGRBase.textContent = yearSliderE.value;
//     updateMapStyle_popchange(yearSliderS.value, yearSliderE.value); // 関数を呼び出し
//     updateMapStyle_LCChangeRate(yearSliderS.value, yearSliderE.value); // 関数を呼び出し
// });



/////////////////   色の設定　　//////////////////
// 数字 = aSmallpop * (n ^ k) (k=1, 2, 3...)
var aSmallpop = [7**5, 7**4, 7**3, 7**2, 7];  // 最初の数
var n = 2;                                  // 何をかけるか

// 色を設定する関数、yearの値によって色が変わる
function updateMapStyle_pop(year) {
    if (map.getLayer('population-fill-layer')) {
        map.setPaintProperty('population-fill-layer', 'fill-color', [
            "step",
            ["zoom"],
            [
                "case",
                ["<=", ["get", `POP_${year}`], aSmallpop[0]]     , "rgb(255, 255, 255)",
                ["<=", ["get", `POP_${year}`], aSmallpop[0]*n]   , "rgb(255, 227, 227)",
                ["<=", ["get", `POP_${year}`], aSmallpop[0]*n**2], "rgb(255, 198, 198)",
                ["<=", ["get", `POP_${year}`], aSmallpop[0]*n**3], "rgb(255, 170, 170)",
                ["<=", ["get", `POP_${year}`], aSmallpop[0]*n**4], "rgb(255, 142, 142)",
                ["<=", ["get", `POP_${year}`], aSmallpop[0]*n**5], "rgb(255, 113, 113)",
                ["<=", ["get", `POP_${year}`], aSmallpop[0]*n**6], "rgb(255, 85, 85)",
                ["<=", ["get", `POP_${year}`], aSmallpop[0]*n**7], "rgb(255, 57, 57)",
                ["<=", ["get", `POP_${year}`], aSmallpop[0]*n**8], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            6, [
                "case",
                ["<=", ["get", `POP_${year}`], aSmallpop[1]]     , "rgb(255, 255, 255)",
                ["<=", ["get", `POP_${year}`], aSmallpop[1]*n]   , "rgb(255, 227, 227)",
                ["<=", ["get", `POP_${year}`], aSmallpop[1]*n**2], "rgb(255, 198, 198)",
                ["<=", ["get", `POP_${year}`], aSmallpop[1]*n**3], "rgb(255, 170, 170)",
                ["<=", ["get", `POP_${year}`], aSmallpop[1]*n**4], "rgb(255, 142, 142)",
                ["<=", ["get", `POP_${year}`], aSmallpop[1]*n**5], "rgb(255, 113, 113)",
                ["<=", ["get", `POP_${year}`], aSmallpop[1]*n**6], "rgb(255, 85, 85)",
                ["<=", ["get", `POP_${year}`], aSmallpop[1]*n**7], "rgb(255, 57, 57)",
                ["<=", ["get", `POP_${year}`], aSmallpop[1]*n**8], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            8, [
                "case",
                ["<=", ["get", `POP_${year}`], aSmallpop[2]]     , "rgb(255, 255, 255)",
                ["<=", ["get", `POP_${year}`], aSmallpop[2]*n]   , "rgb(255, 227, 227)",
                ["<=", ["get", `POP_${year}`], aSmallpop[2]*n**2], "rgb(255, 198, 198)",
                ["<=", ["get", `POP_${year}`], aSmallpop[2]*n**3], "rgb(255, 170, 170)",
                ["<=", ["get", `POP_${year}`], aSmallpop[2]*n**4], "rgb(255, 142, 142)",
                ["<=", ["get", `POP_${year}`], aSmallpop[2]*n**5], "rgb(255, 113, 113)",
                ["<=", ["get", `POP_${year}`], aSmallpop[2]*n**6], "rgb(255, 85, 85)",
                ["<=", ["get", `POP_${year}`], aSmallpop[2]*n**7], "rgb(255, 57, 57)",
                ["<=", ["get", `POP_${year}`], aSmallpop[2]*n**8], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            10, [
                "case",
                ["<=", ["get", `POP_${year}`], aSmallpop[3]]     , "rgb(255, 255, 255)",
                ["<=", ["get", `POP_${year}`], aSmallpop[3]*n]   , "rgb(255, 227, 227)",
                ["<=", ["get", `POP_${year}`], aSmallpop[3]*n**2], "rgb(255, 198, 198)",
                ["<=", ["get", `POP_${year}`], aSmallpop[3]*n**3], "rgb(255, 170, 170)",
                ["<=", ["get", `POP_${year}`], aSmallpop[3]*n**4], "rgb(255, 142, 142)",
                ["<=", ["get", `POP_${year}`], aSmallpop[3]*n**5], "rgb(255, 113, 113)",
                ["<=", ["get", `POP_${year}`], aSmallpop[3]*n**6], "rgb(255, 85, 85)",
                ["<=", ["get", `POP_${year}`], aSmallpop[3]*n**7], "rgb(255, 57, 57)",
                ["<=", ["get", `POP_${year}`], aSmallpop[3]*n**8], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ],
            12, [
                "case",
                ["<=", ["get", `POP_${year}`], aSmallpop[4]]     , "rgb(255, 255, 255)",
                ["<=", ["get", `POP_${year}`], aSmallpop[4]*n]   , "rgb(255, 227, 227)",
                ["<=", ["get", `POP_${year}`], aSmallpop[4]*n**2], "rgb(255, 198, 198)",
                ["<=", ["get", `POP_${year}`], aSmallpop[4]*n**3], "rgb(255, 170, 170)",
                ["<=", ["get", `POP_${year}`], aSmallpop[4]*n**4], "rgb(255, 142, 142)",
                ["<=", ["get", `POP_${year}`], aSmallpop[4]*n**5], "rgb(255, 113, 113)",
                ["<=", ["get", `POP_${year}`], aSmallpop[4]*n**6], "rgb(255, 85, 85)",
                ["<=", ["get", `POP_${year}`], aSmallpop[4]*n**7], "rgb(255, 57, 57)",
                ["<=", ["get", `POP_${year}`], aSmallpop[4]*n**8], "rgb(255, 28, 28)",
                "rgb(255, 0, 0)"
            ]
        ]);
    }
}

// 色を設定する関数、yearの値によって色が変わる
function updateMapStyle_popchange(syear, eyear) {
    if (map.getLayer('popchange-fill-layer')) {
        map.setPaintProperty('popchange-fill-layer', 'fill-color', color_popchange(syear, eyear));  // 具体的な色の指定はcolor_popchangeでしている
    }
}


/////////////////   色の設定　　//////////////////
// 数字 = m * bstep * k (k=....-3,-2,-1,1, 2, 3...)
var m =  [7**5, 7**4, 7**3, 7**2, 7];         // 何をかけるか
var bstep =  1;                     //　ベースステップ

const color_popchange = (compareYear, baseYear) => {
       return [
            "step",
            ["zoom"],
            [
                "step",
                ["-", ["get", `POP_${baseYear}`], ["get", `POP_${compareYear}`]],
                "rgb(0, 0, 255)", 
                -5* bstep * m[0],"rgb(51, 102, 255)", 
                -4* bstep * m[0],"rgb(102, 153, 255)",
                -3* bstep * m[0],"rgb(153, 204, 255)",
                -2* bstep * m[0],"rgb(204, 229, 255)",
                -1* bstep * m[0],"rgb(255, 255, 255)",
                1* bstep * m[0],"rgb(255, 204, 204)",
                2* bstep * m[0],"rgb(255, 153, 153)",
                3* bstep * m[0],"rgb(255, 102, 102)",
                4* bstep * m[0],"rgb(255, 51, 51)",
                5* bstep * m[0],"rgb(255, 0, 0)"
            ],
            6,[
                "step",
                ["-", ["get", `POP_${baseYear}`], ["get", `POP_${compareYear}`]],
                "rgb(0, 0, 255)", 
                -5* bstep * m[1],"rgb(51, 102, 255)", 
                -4* bstep * m[1],"rgb(102, 153, 255)",
                -3* bstep * m[1],"rgb(153, 204, 255)",
                -2* bstep * m[1],"rgb(204, 229, 255)",
                -1* bstep * m[1],"rgb(255, 255, 255)",
                1* bstep * m[1],"rgb(255, 204, 204)",
                2* bstep * m[1],"rgb(255, 153, 153)",
                3* bstep * m[1],"rgb(255, 102, 102)",
                4* bstep * m[1],"rgb(255, 51, 51)",
                5* bstep * m[1],"rgb(255, 0, 0)"
            ],
           8,[
               "step",
              ["-", ["get", `POP_${baseYear}`], ["get", `POP_${compareYear}`]],
                     "rgb(0, 0, 255)", 
             -5* bstep * m[2],"rgb(51, 102, 255)", 
             -4* bstep * m[2],"rgb(102, 153, 255)",
             -3* bstep * m[2],"rgb(153, 204, 255)",
             -2* bstep * m[2],"rgb(204, 229, 255)",
             -1* bstep * m[2],"rgb(255, 255, 255)",
              1* bstep * m[2],"rgb(255, 204, 204)",
              2* bstep * m[2],"rgb(255, 153, 153)",
              3* bstep * m[2],"rgb(255, 102, 102)",
              4* bstep * m[2],"rgb(255, 51, 51)",
              5* bstep * m[2],"rgb(255, 0, 0)"
           ],
           10, [
               "step",
              ["-", ["get", `POP_${baseYear}`], ["get", `POP_${compareYear}`]],
                    "rgb(0, 0, 255)", 
             -5* bstep * m[3],"rgb(51, 102, 255)", 
             -4* bstep * m[3],"rgb(102, 153, 255)",
             -3* bstep * m[3],"rgb(153, 204, 255)",
             -2* bstep * m[3],"rgb(204, 229, 255)",
             -1* bstep * m[3],"rgb(255, 255, 255)",
              1* bstep * m[3],"rgb(255, 204, 204)",
              2* bstep * m[3],"rgb(255, 153, 153)",
              3* bstep * m[3],"rgb(255, 102, 102)",
              4* bstep * m[3],"rgb(255, 51, 51)",  
              5* bstep * m[3],"rgb(255, 0, 0)" 
           ],
           12, [
               "step",
              ["-", ["get", `POP_${baseYear}`], ["get", `POP_${compareYear}`]],
                   "rgb(0, 0, 255)",
              -5* bstep * m[4],"rgb(51, 102, 255)",
              -4* bstep * m[4],"rgb(102, 153, 255)",
              -3* bstep * m[4],"rgb(153, 204, 255)",
              -2* bstep * m[4],"rgb(204, 229, 255)",
              -1* bstep * m[4],"rgb(255, 255, 255)",
               1* bstep * m[4],"rgb(255, 204, 204)",
               2* bstep * m[4],"rgb(255, 153, 153)",
               3* bstep * m[4],"rgb(255, 102, 102)",
               4* bstep * m[4],"rgb(255, 51, 51)",
               5* bstep * m[4],"rgb(255, 0, 0)" 
           ]
       ];
   }


/////////////////   色の設定 (LC変化率)   //////////////////

// LC (土地被覆) の変化率を更新する関数
function updateMapStyle_LCChangeRate(populationYear, baseYear) {
    if (map.getLayer('LCRPGR-fill-layer')) {
        const lcChangeRate = [
            "/",
            ["/", ["-", ["to-number", ["get", `LC_${baseYear}`]], ["to-number", ["get", `LC_${populationYear}`]]], ["to-number", ["get", `LC_${baseYear}`]]],
            ["-", ["ln", ["to-number", ["get", `POP_${baseYear}`]]], ["ln", ["to-number", ["get", `POP_${populationYear}`]]]]
        ];

        const smallChangeCondition = [
            "any",
            ["==", ["to-number", ["get", `POP_${baseYear}`]], 0],
            ["==", ["to-number", ["get", `POP_${populationYear}`]], 0],
            ["==", ["to-number", ["get", `LC_${baseYear}`]], 0],
            ["==", ["to-number", ["get", `POP_${baseYear}`]], ["to-number", ["get", `POP_${populationYear}`]]],
            ["<=", ["+",
                ["^", ["/", ["-", ["to-number", ["get", `LC_${baseYear}`]], ["to-number", ["get", `LC_${populationYear}`]]], ["to-number", ["get", `LC_${baseYear}`]]], 2],
                ["^", ["-", ["ln", ["to-number", ["get", `POP_${baseYear}`]]], ["ln", ["to-number", ["get", `POP_${populationYear}`]]]], 2]
            ], 0.0091]
        ];

        map.setPaintProperty('LCRPGR-fill-layer', 'fill-color', [
            "case",
            smallChangeCondition, "transparent", // 色なし
            ["all", [">=", lcChangeRate, -4],    ["<=", lcChangeRate, -0.25]], "#FF0000",
            ["all", [">=", lcChangeRate, -0.25], ["<=", lcChangeRate, 0.25]],  "#87CEEB",
            ["all", [">=", lcChangeRate, 0.25],  ["<=", lcChangeRate, 4]],     "#ADFF2F",
            "#FFA500"
        ]);
    }
}

/*******************************************************************
 * ズームレベル表示
 * *************************************************************** */

const updateZoomLevel = () => {
    const zoom = map.getZoom().toFixed(2);
    document.getElementById('zoom-level').innerText = `Zoom: ${zoom}`;
}

map.on('zoom', updateZoomLevel);
updateZoomLevel();






/*******************************************************************
 * スケール表示
 * *************************************************************** */
const scale = new maplibregl.ScaleControl({
    maxWidth: 80,
    unit: 'metric'
});
map.addControl(scale, 'bottom-right');



/*******************************************************************
 * メモ機能
 * *************************************************************** */
const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
        point: true,
        line_string: true,
        polygon: true,
        trash: true
    }
});

map.addControl(draw);

let selectedFeatureId;

document.getElementById('save-note-btn').addEventListener('click', () => {
    const noteText = document.getElementById('note-text').value;
    if (selectedFeatureId) {
        draw.setFeatureProperty(selectedFeatureId, 'note', noteText);

        console.log(`Feature ID: ${selectedFeatureId}, Note: ${noteText}`);

        document.getElementById('note-form').style.display = 'none';
        alert('メモが保存されました');
    }
});

map.on('draw.create', function (e) {
    const feature = e.features[0];
    if (feature.geometry.type === 'Point') {
        selectedFeatureId = feature.id;
        console.log(`Created Feature ID: ${selectedFeatureId}`);
        document.getElementById('note-form').style.display = 'block';
    }
});

map.on('draw.update', function (e) {
    const feature = e.features[0];
    if (feature.geometry.type === 'Point') {
        selectedFeatureId = feature.id;
        console.log(`Updated Feature ID: ${selectedFeatureId}`);
        document.getElementById('note-form').style.display = 'block';
    }
});


map.on('click', (e) => {
    console.log(`クリック位置: 緯度 ${e.lngLat.lat}, 経度 ${e.lngLat.lng}`);
    console.log(`クリック位置 (ピクセル): X ${e.point.x}, Y ${e.point.y}`);

    const features = draw.getAll().features.filter(feature => feature.geometry.type === 'Point');
    if (features.length > 0) {
        const nearestFeature = features.reduce((nearest, feature) => {
            const distance = turf.distance(
                turf.point(feature.geometry.coordinates),
                turf.point([e.lngLat.lng, e.lngLat.lat])
            );
            return distance < nearest.distance ? { feature, distance } : nearest;
        }, { 
            feature: null, distance: Infinity 
        });

        if (nearestFeature.feature) {
            const note = nearestFeature.feature.properties.note || '  ';
            console.log(`Clicked Feature ID: ${nearestFeature.feature.id}, Note: ${note}`);

            const coords = nearestFeature.feature.geometry.coordinates;
            const point = map.project(coords); // ポイントフィーチャーの位置に表示

            document.getElementById('note-content').innerText = note;
            const noteDisplay = document.getElementById('note-display');
            noteDisplay.style.display = 'block';
            noteDisplay.style.position = 'absolute';
            noteDisplay.style.left = `${point.x + 10}px`; // ポイントフィーチャーの少し右に表示
            noteDisplay.style.top = `${point.y - 10}px`; // ポイントフィーチャーの少し上に表示
        } else {
            console.log('No point feature found at clicked point');
            document.getElementById('note-display').style.display = 'none';
        }
    } else {
        console.log('No feature found at clicked point');
        document.getElementById('note-display').style.display = 'none';
    }
});

// メモボックスの表示位置を更新するための関数
function updateNoteDisplayPosition(lngLat) {
    const noteDisplay = document.getElementById('note-display');
    const point = map.project(lngLat);
    noteDisplay.style.left = `${point.x + 10}px`; // ポイントフィーチャーの少し右に表示
    noteDisplay.style.top = `${point.y - 10}px`; // ポイントフィーチャーの少し上に表示
}

let noteLngLat = null; // メモボックスの地理座標を保存する変数

map.on('zoom', () => {
    if (noteLngLat) {
        updateNoteDisplayPosition(noteLngLat);
    }
});

map.on('move', () => {
    if (noteLngLat) {
        updateNoteDisplayPosition(noteLngLat);
    }
});


// 例: ポイントクリック時にメモボックスを表示し、位置を保存する
map.on('click', handleMapClick);
map.on('touchend', handleMapClick);

function handleMapClick(e) {
    const features = draw.getAll().features.filter(feature => feature.geometry.type === 'Point');
    if (features.length > 0) {
        const nearestFeature = features.reduce((nearest, feature) => {
            const distance = turf.distance(
                turf.point(feature.geometry.coordinates),
                turf.point([e.lngLat.lng, e.lngLat.lat])
            );
            return distance < nearest.distance ? { feature, distance } : nearest;
        }, { feature: null, distance: Infinity });

        if (nearestFeature.feature) {
            noteLngLat = nearestFeature.feature.geometry.coordinates;
            updateNoteDisplayPosition(noteLngLat);
            const note = nearestFeature.feature.properties.note || ' ';
            document.getElementById('note-content').innerText = note;
            document.getElementById('note-display').style.display = 'block';
        } else {
            document.getElementById('note-display').style.display = 'none';
        }
    } else {
        document.getElementById('note-display').style.display = 'none';
    }
}



// /*******************************************************************
//  * レイヤ管理
//  * *************************************************************** */
// 関数にチェックボタンON/OFFに関する引数を入れると、map上のレイヤON/OFFを反映して引き継げる（予定）

function addsourcelayers(firstSymbolId, font) {


// ////////////////////ソース///////////////////


    map.addSource('population-source', {
        'type': 'vector',
        'tiles': [
        'pmtiles://https://nnkKM.github.io/TLS_01_2/data/LCRPGR.pmtiles/{z}/{x}/{y}'
        ],
        'minzoom': 0,
        'maxzoom': 12,
        'attribution': '<a href="https://opengeohub.org/about/" target="_blank">OpenGeoHub</a>'
    });

    map.addSource('PublicTransport-source', {
        'type': 'vector',
        'tiles': [
        'pmtiles://https://nnkhij.github.io/test6/data/PublicTransport.pmtiles/{z}/{x}/{y}'
        ],
        'minzoom': 4,
        'maxzoom': 14,
        'attribution': '<a href="https://dilimicroletroutes.github.io/" target="_blank">DiliMicroletRoutes</a>'
    });

    map.addSource('pm25-source', {
        'type': 'vector',
        'tiles': [
        'pmtiles://https://nnkKM.github.io/TLS_01_2/data/PM25.pmtiles/{z}/{x}/{y}'
        ],
        'minzoom': 4,
        'maxzoom': 14,
        'attribution': '<a href="https://inetl-ip.gov.tl/" target="_blank">Baliza data</a>'
    });


    /////////////////      レイヤ      ////////////////////////////////
    map.addLayer({
        'id': 'PM25-fill-layer',
        'type': 'fill',
        'source': 'pm25-source',
        'source-layer': 'PM2_5',
        'layout': {
        'visibility': 'none'
        },
        'paint': {
        'fill-color': [
            'case',
            ['<=', ['coalesce', ['get', 'PM25'], ['get', 'Pm25PopWam']],  10.0], '#ffffff',
            ['<=', ['coalesce', ['get', 'PM25'], ['get', 'Pm25PopWam']],  10.5], '#ffffcc',
            ['<=', ['coalesce', ['get', 'PM25'], ['get', 'Pm25PopWam']],  11.0], '#ffeb99',
            ['<=', ['coalesce', ['get', 'PM25'], ['get', 'Pm25PopWam']],  11.5], '#ffd966',
            ['<=', ['coalesce', ['get', 'PM25'], ['get', 'Pm25PopWam']],  12.0], '#ffcc33',
            ['<=', ['coalesce', ['get', 'PM25'], ['get', 'Pm25PopWam']],  12.5], '#ffbf00',
            ['<=', ['coalesce', ['get', 'PM25'], ['get', 'Pm25PopWam']],  13.0], '#e6ac00',
            ['<=', ['coalesce', ['get', 'PM25'], ['get', 'Pm25PopWam']],  13.5], '#cc9900',
            ['<=', ['coalesce', ['get', 'PM25'], ['get', 'Pm25PopWam']],  14.0], '#b38600',
            '#996633'
        ],
        'fill-opacity': 0.6
        }
    },firstSymbolId );

    map.addLayer({
        id: 'LCRPGR-fill-layer', // 新しいレイヤーのID
        type: 'fill', // 塗りつぶしレイヤー
        source: 'population-source', // データソースID
        'source-layer': 'LCRPGR', // ベクトルタイルのレイヤー名
        'layout': {
            "visibility": "none"
        },
        paint: {
            'fill-color': '#CCCCCC', // 初期色（デフォルト色）
            'fill-opacity': 0.8 // 不透明度
        }
    },firstSymbolId);

    map.addLayer({
        'id': 'population-fill-layer',
        'type': 'fill',
        'source': 'population-source',
        'source-layer': 'LCRPGR',
        'paint': {
        'fill-color': '#ffffff',
        'fill-opacity': 0.5
        }
    },firstSymbolId );

    map.addLayer({
        'id': 'popchange-fill-layer',
        'type': 'fill',
        'source': 'population-source',
        'source-layer': 'LCRPGR',
        'paint': {
        'fill-color': '#ffffff',
        'fill-opacity': 0.5
        }
    },firstSymbolId );

    map.addLayer({
        'id': 'population-outline-layer',
        'type': 'line',
        'source': 'population-source',
        'source-layer': 'LCRPGR',
        'paint':
        {
        'line-color': '#c0c0c0',
        'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 0.2,
            14, 1
        ]
        }
    },firstSymbolId );
    
    map.addLayer({
        'id': 'MicroletRoute-outline-layer',
        'type': 'line',
        'source': 'PublicTransport-source',
        'source-layer': 'MicroletRoute',
        'paint': {
        'line-color': '#000000',
        'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.1,
            12, 3.4
        ]
        }
    },firstSymbolId );
    
    // 内側の線（本体部分）
    map.addLayer({
        'id': 'MicroletRoute-line-layer',
        'type': 'line',
        'source': 'PublicTransport-source',
        'source-layer': 'MicroletRoute',
        'paint': {
            'line-color': '#00CC00', // 内側の色（緑）
            'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                8, 0.05,  // 内側の幅
                12, 1.7
            ]
        }
    }, firstSymbolId);


    map.addLayer({
        'id': 'PublicTransport-points-layer',
        'type': 'circle',
        'source': 'PublicTransport-source',
        'source-layer': 'PublicTransport',
        'paint': {
        'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 1,
            14, 6
        ],
        'circle-color': [
            'match',
            ['get', 'amenity'],
            'ferry_terminal', '#0000FF',
            'bus_stop','#00FF00',
            'bus_station','#00FF00',
            '#ff8c00'
        ],
        'circle-stroke-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4, 0.2,
            14, 1
        ],
        'circle-stroke-color': '#000000'
        }
    },firstSymbolId );
    


    map.addLayer({
        'id': 'MUNICIPIO-outline-layer',
        'type': 'line',
        'source': 'pm25-source',
        'source-layer': 'boundaries',
        'filter': ['in', 'admin_level', 4, '4'],
        'paint': {
            'line-color': '#9E9CAB',
            'line-dasharray': [6, 2, 2, 2],
            'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                4, 0.2,
                8, 1.5,
                12, 3
            ]
        }
     },firstSymbolId );
        
    map.addLayer({
        'id': 'PostuAdministrativo-outline-layer',
        'type': 'line',
        'source': 'pm25-source',
        'source-layer': 'boundaries',
        'filter': ['in', 'admin_level', 5, '5'],
        'paint': {
        'line-color': '#9E9CAB',
        'line-dasharray': [3, 1, 1, 1],
        'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 1,
            12, 2
        ]
        },
       'minzoom': 8
    },firstSymbolId );
    
    map.addLayer({
        'id': 'Suco-outline-layer',
        'type': 'line',
        'source': 'pm25-source',
        'source-layer': 'boundaries',
        'filter': ['in', 'admin_level', 6, '6'],
        'paint': {
        'line-color': '#9E9CAB',
        'line-dasharray': [3, 1, 1, 1],
        'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.5,
            12, 1
        ]
        },
       'minzoom': 10
    },firstSymbolId );
    

     map.addLayer({
       'id': 'Suco-label-layer',
       'type': 'symbol',
       'source': 'pm25-source',
       'source-layer': 'PM2_5',
       'layout': {
        'text-field': [
           'case',
            ['has', 'SUCO'], ['get', 'SUCO'], 
            ['has', 'P_ADMIN'], ['get', 'P_ADMIN'], 
            ['has', 'MUNICIPIO'], ['get', 'MUNICIPIO'],
            ''
        ],
         'text-font': [ font],
        'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 10,
            10, 10,
            15, 20 
        ],
         'text-anchor': 'center'
       },
       'paint': {
         'text-color': '#000000'
       }
     });

}

function getsymbolID() {
    const layers = map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    let firstSymbolId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    return firstSymbolId;
}
