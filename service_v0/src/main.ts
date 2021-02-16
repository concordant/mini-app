import { crdtlib } from '@concordant/c-crdtlib';
import { client } from '@concordant/c-client';

let CONFIG = require('./config.json');
let session = client.Session.Companion.connect(CONFIG.dbName, CONFIG.serviceUrl, CONFIG.credentials);
let collection = session.openCollection("miniAppCollection", false);

import { PNCounter } from './PNCounter';

const myPNCounter: HTMLElement | null =
    document.getElementById('my_pncounter');
if (myPNCounter == null) {
    throw new Error("my_pncounter element is missing in DOM");
}

var pncounter = new PNCounter(session, collection);

myPNCounter.appendChild(pncounter.render());

import { GList } from './RGASimpleList';

const myRGA: HTMLElement | null =
    document.getElementById('my_rga');
if (myRGA == null) {
    throw new Error("root element is missing in DOM");
}

var glA = new GList(session, collection);

myRGA.appendChild(glA.render());

import { LWWMap } from './LWWMap';

const myLWWMap: HTMLElement | null =
    document.getElementById('my_lwwmap');
if (myLWWMap == null) {
    throw new Error("my_lwwmap element is missing in DOM");
}

var mapC = new LWWMap(session, collection);

myLWWMap.appendChild(mapC.render());

import { LWWRegister } from './LWWRegister';

const myLWWRegister: HTMLElement | null =
    document.getElementById('my_lwwregister');
if (myLWWRegister == null) {
    throw new Error("my_lwwregister element is missing in DOM");
}

var lregisterE = new LWWRegister(session, collection);

myLWWRegister.appendChild(lregisterE.render());

import { MVRegister } from './MVRegister';

const myMVRegister: HTMLElement | null =
    document.getElementById('my_mvregister');
if (myMVRegister == null) {
    throw new Error("my_mvregister element is missing in DOM");
}

var mvrg = new MVRegister(session, collection);

myMVRegister.appendChild(mvrg.render());

import { MVMap } from './MVMap';

const myMVMap: HTMLElement | null =
    document.getElementById('my_mvmap');
if (myMVMap == null) {
    throw new Error("my_mvmap element is missing in DOM");
}

var mvmap = new MVMap(session, collection);

myMVMap.appendChild(mvmap.render());