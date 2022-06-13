const BASE_URL_DBLP = "https://dblp.org/pid/";

const myPID = '203/9213'; // JT
// const myPID = '54/4758'; // SB
//const myPID = '61/8036'; //MP
// const myPID = '227/4719'; // TD
// const myPID = '203/8627'; // LI



function getDBLPUrl(pid) {
    return BASE_URL_DBLP + pid;
}

function getListPublications(xml) {
    return xml.getElementsByTagName("r");
}

function getTitleFromPublication(pub) {
    return pub.firstChild.getElementsByTagName("title")[0].innerHTML;
}

function getNamePid(xml) {
    return xml.getElementsByTagName("dblpperson")[0].getElementsByTagName("person")[0].getElementsByTagName("author")[0].innerHTML;
}

function getListAuthorsFromPublication(pub) {
    return pub.firstChild.getElementsByTagName("author");
}

function getPidFromAuthor(author) {
    return author.getAttribute("pid");
}

function getNameFromAuthor(author) {
    return author.innerHTML;
}

function getYearFromPublication(pub) {
    if (pub.firstChild.getElementsByTagName("year").length != 0)
        return pub.firstChild.getElementsByTagName("year")[0].innerHTML;
    return;
}

function getPubliTypeFromPublication(pub) {
    return pub.firstChild.nodeName;
}

function getPubliUrlFromPublication(pub) {
    if (pub.firstChild.getElementsByTagName("ee").length != 0)
        return pub.firstChild.getElementsByTagName("ee")[0].innerHTML;
    return;
}

function getKeyFromPublication(pub) {
    return pub.firstChild.getAttribute("key");
}

function getPublicationDBLPUrlFromKey(key) {
    return "https://dblp.org/rec/" + key + ".html";
}

function isArxiv(keyPub) {
    return keyPub.substr(0, 4) === 'abs-';
}

function formatLabel(keyPub) {
    if (!isArxiv(keyPub)) {
        return keyPub.replace(/[a-z]/g, '');
    } else {
        // return "ArX-" + keyPub.slice(4);
        return "CoRR";
    }
}