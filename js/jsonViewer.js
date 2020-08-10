class TogglerButton {
    constructor(elementID, togglerFunction) {
        this.element = document.getElementById(elementID);
        this.activeIndex = 0;
        this.activeClass = "active";
        let childLength = this.element.children.length;
        const cThis = this;
        for (let i = 0; i < childLength; i++) {
            if (this.element.children[i].classList.contains("active")) this.activeIndex = i + 1;
            this.element.children[i].addEventListener("click", function (e) {
                if (cThis.onActiveChanged(e))
                    togglerFunction();
            });
        }
    }
    onActiveChanged(event) {
        let target = event.target;
        let activeElem = this.element.children[this.activeIndex - 1];
        if (parseInt(target.dataset.index) === this.activeIndex) return false;
        if (activeElem.classList.contains(this.activeClass))
            activeElem.classList.remove(this.activeClass);
        this.activeIndex = parseInt(target.dataset.index);
        if (!target.classList.contains(this.activeClass))
            target.classList.add(this.activeClass);
        return true;
    }
}

class DataFetcher {
    constructor() {
        this.dataType = "";
        this.dataObject = {};
        this.dataString = "";
        this.dataTree = document.createElement("div");
    }
    prepareDataTree(objectValue, parent) {
        let entryList;
        try {
            entryList = Object.entries(objectValue);
        } catch (error) {
            return;
        }
        let listSize = entryList.length;
        for (let i = 0; i < listSize; i++) {
            let vTree = document.createElement("div");
            vTree.setAttribute("class", "viewer-tree");
            let vParent = document.createElement("div");
            vParent.setAttribute("class", "viewer-parent");
            let keyP = document.createElement("p");
            keyP.innerHTML = `${entryList[i][0]}&nbsp;<span>:</span>`;
            vParent.append(keyP);
            vTree.append(vParent);

            if (entryList[i][1] == null || entryList[i][1] == undefined) {
                let val = document.createElement("p");
                val.setAttribute("class", "valE");
                val.innerHTML = `${entryList[i][1]}`;
                vParent.append(val);
            }
            else if (typeof entryList[i][1] === "boolean") {
                let val = document.createElement("p");
                val.setAttribute("class", "valE");
                val.innerHTML = entryList[i][1];
                vParent.append(val);
            }
            else if (typeof entryList[i][1] === "number") {
                let val = document.createElement("p");
                val.setAttribute("class", "valN");
                val.innerHTML = entryList[i][1];
                vParent.append(val);
            }
            else if (typeof entryList[i][1] === "string") {
                let val = document.createElement("p");
                val.setAttribute("class", "valS");
                val.innerHTML = entryList[i][1];
                vParent.append(val);
            }
            else {
                vParent.classList.add("clickable");
                vParent.dataset.status = "closed";
                vParent.addEventListener("click", (event) => {
                    let target = event.target;
                    while (!target.classList.contains("viewer-parent")) {
                        target = target.parentNode;
                    }
                    toggleViewerChild(target);
                });
                let dropDownBtn = document.createElement("div");
                dropDownBtn.innerHTML = "<svg class=\"toggler\" viewBox=\"0 0 100 100\">"
                    + "<path d = \"M20,20 L80,50 L20,80Z\" /></svg>";
                vParent.append(dropDownBtn);
                let vChild = document.createElement("div");
                vChild.setAttribute("class", "viewer-child");
                vChild.setAttribute("style", "height: 0;");
                this.prepareDataTree(entryList[i][1], vChild);
                vTree.append(vChild);
            }
            parent.append(vTree);
        }
    }
    updateData(data = "") {
        this.dataString = data;
        if (this.dataType.includes("json")) {
            this.dataObject = JSON.parse(data);
            this.dataTree.setAttribute("class", "viewer-root");
            this.dataTree.innerHTML = "";
            this.prepareDataTree(this.dataObject, this.dataTree);
        }
    }
    fetchUrl(url, onDataRecieved, method = "GET", headers = []) {
        let httpReq = new XMLHttpRequest();
        const cThis = this;
        httpReq.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                cThis.dataType = this.getResponseHeader("content-type");
                cThis.updateData(this.responseText);
                onDataRecieved(true);
            }
            if (this.readyState == 4 && this.status != 200) {
                cThis.dataType = "UNKNOWN";
                cThis.updateData(this.statusText);
                onDataRecieved(false);
            }
        }
        httpReq.open(method, url, true);
        let headerList = Object.entries(headerForm.headerRecieved);
        headerList.forEach(kv => {
            httpReq.setRequestHeader(kv[0], kv[1]);
        });
        httpReq.send();
    }
}

class HeaderForm {
    constructor(btnAddID = "", btnResetID = "", inpKeyID = "", inpValID = "", dispID = "", modalID = "header_modal") {
        this.btnAdd = document.getElementById(btnAddID);
        this.btnReset = document.getElementById(btnResetID);
        this.dispElem = document.getElementById(dispID);
        this.inpKey = document.getElementById(inpKeyID);
        this.inpVal = document.getElementById(inpValID);
        this.modalID = modalID;
        this.headerRecieved = {};
        const cThis = this;
        this.btnReset.addEventListener("click", (e) => {
            cThis.setOnReset();
        });
        this.btnAdd.addEventListener("click", (e) => {
            cThis.setOnAdd();
        });
        this.updateDisplay();
    }
    updateDisplay() {
        let headerlist = Object.entries(this.headerRecieved);
        if (headerlist.length == 0) {
            this.dispElem.innerHTML = "None";
        }
        else {
            this.dispElem.innerHTML = "";
            const cThis = this;
            for (let i = 0; i < headerlist.length; i++) {
                let divChip = document.createElement("div");
                divChip.setAttribute("class", "header-chip");
                divChip.setAttribute("id", `${headerlist[i][0]}`);
                let chipKey = document.createElement("span");
                chipKey.innerHTML = `${headerlist[i][0]}:&nbsp;`;
                let chipVal = document.createElement("span");
                chipVal.innerHTML = `${headerlist[i][1]}`;
                let chipClear = document.createElement("span");
                chipClear.setAttribute("class", "header-clear");
                chipClear.innerHTML = "&times;";
                chipClear.addEventListener("click", (e) => {
                    delete cThis.headerRecieved[e.target.parentNode.id];
                    cThis.updateDisplay();
                });
                divChip.append(chipKey, chipVal, chipClear);
                this.dispElem.append(divChip);
            }
        }
    }
    setOnReset() {
        this.inpKey.value = "";
        this.inpVal.value = "";
    }
    setOnAdd() {
        if (this.inpKey.value.length == 0) {
            this.inpKey.parentNode.querySelector(".error-msg").innerHTML = "Key Required";
            setTimeout(() => {
                this.inpKey.parentNode.querySelector(".error-msg").innerHTML = "";
            }, 4000);
        }
        else {
            this.headerRecieved[this.inpKey.value] = (isNaN(this.inpVal.value)) ? this.inpVal.value : parseFloat(this.inpVal.value);
            this.updateDisplay();
            this.setOnReset();
            toggleModal(this.modalID);
        }
    }
}

function toggleLoader() {
    let loader = document.getElementById("jv_loader");
    if (loader.classList.contains("loading-anim"))
        loader.classList.remove("loading-anim");
    else
        loader.classList.add("loading-anim");
}

function getViewBody() {
    return document.getElementById("jv_view_body");
}

function createErrorMsg() {
    getViewBody().innerHTML = `<h3>${dataFetcher.dataString}</h3>`;
}

function createRawView() {
    let element = document.createElement("p");
    element.setAttribute("class", "viewer-data preWrap");
    element.innerHTML = dataFetcher.dataString;
    getViewBody().append(element);
}

function createPrettyView(indent) {
    let element = document.createElement("p");
    element.setAttribute("class", "viewer-data pre");
    element.innerHTML = JSON.stringify(dataFetcher.dataObject, null, indent);
    getViewBody().append(element);
}

function createTreeView() {
    getViewBody().append(dataFetcher.dataTree);
}

function onViewToggleChange() {
    let index = viewToggler.activeIndex;
    getViewBody().innerHTML = "";
    document.getElementById("jv_view_indent").disabled = true;
    if (index == 1) {
        createRawView();
    }
    if (index == 2) {
        document.getElementById("jv_view_indent").disabled = false;
        createPrettyView(4);
    }
    if (index == 3) {
        createTreeView();
    }
}

function toggleViewerChild(element) {
    if (!element.nextElementSibling) return;
    if (element.dataset.status === "closed") {
        element.dataset.status = "opened";
        element.nextElementSibling.style = "height: 100%;";
        element.querySelector("div .toggler").style = "transform: rotateZ(90deg);";
    }
    else {
        element.dataset.status = "closed";
        element.nextElementSibling.style = "height: 0;";
        element.querySelector("div .toggler").style = "";
    }
}

function fetchFromURL() {
    let requester = document.getElementById("jv_request_url");
    let requestUrl = requester.value;
    if (!requestUrl) return;
    let requestMethod = document.getElementById("jv_request_method").value;
    if (!requestUrl.includes("http://") && !requestUrl.includes("https://"))
        requestUrl = "http://" + requestUrl;
    toggleLoader();
    dataFetcher.fetchUrl(requestUrl, (isCompleted) => {
        if (isCompleted) {
            onViewToggleChange();
        } else {
            createErrorMsg();
        }
        toggleLoader();
    }, requestMethod);
}

function changeViewFontSize(fontResizer) {
    getViewBody().style.fontSize = `${fontResizer.value}px`;
}

function changeViewIndent(indenter) {
    getViewBody().innerHTML = "";
    createPrettyView(parseInt(indenter.value));
}

const viewToggler = new TogglerButton("jv_view_toggle", onViewToggleChange);
const dataFetcher = new DataFetcher();
const headerForm = new HeaderForm("header_add", "header_reset", "form_header_key", "form_header_val", "header_list");

window.onload = function () {
    document.getElementById("jv_request_url").addEventListener("keyup", (e) => {
        if (e.key == "Enter") {
            fetchFromURL();
        }
    })
    document.getElementById("jv_fetcher_btn").addEventListener("click", (e) => {
        fetchFromURL();
    });
}
