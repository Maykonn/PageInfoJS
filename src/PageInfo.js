import InternalEventsList from "./EventsList";
import Time from "./Time";
import EventsCollection from "./EventsCollection";
import PageInfoError from "./ErrorWrapper";

export default class PageInfo {

  constructor(clientCallbacks) {
    /**
     * @type {PageInfoTime}
     */
    this.Time = new Time();
    this.Errors = [];
    this._Events = new EventsCollection(clientCallbacks);

    window.document.onreadystatechange = () => {
      if (this._Events.has(InternalEventsList.DocumentReadyStateChanged.Any)) {
        this._Events.get(InternalEventsList.DocumentReadyStateChanged.Any)(this, window.document.readyState);
      }

      switch (window.document.readyState) {
        case 'uninitialized':
          if (this._Events.has(InternalEventsList.DocumentReadyStateChanged.ToUninitialized)) {
            this._Events.get(InternalEventsList.DocumentReadyStateChanged.ToUninitialized)(this);
          }
          break;
        case 'loading':
          if (this._Events.has(InternalEventsList.DocumentReadyStateChanged.ToLoading)) {
            this._Events.get(InternalEventsList.DocumentReadyStateChanged.ToLoading)(this);
          }
          break;
        case 'loaded':
          if (this._Events.has(InternalEventsList.DocumentReadyStateChanged.ToLoaded)) {
            this._Events.get(InternalEventsList.DocumentReadyStateChanged.ToLoaded)(this);
          }
          break;
        case 'interactive':
          if (this._Events.has(InternalEventsList.DocumentReadyStateChanged.ToInteractive)) {
            this._Events.get(InternalEventsList.DocumentReadyStateChanged.ToInteractive)(this);
          }
          break;
        case 'complete':
          if (this._Events.has(InternalEventsList.DocumentReadyStateChanged.ToComplete)) {
            this._Events.get(InternalEventsList.DocumentReadyStateChanged.ToComplete)(this);
          }
          break;
      }
    };

    window.onerror = (error, url, line, column, asString) => {
      const ErrorWrapper = new PageInfoError(error, url, line, column, asString);
      this.Errors.push(ErrorWrapper);

      if (this._Events.has(InternalEventsList.OnError)) {
        this._Events.get(InternalEventsList.OnError)(this, ErrorWrapper);
      }
    };

    new Promise((resolve) => {
      this._elements = window.document.getElementsByTagName('*');
      this._elementsNumber = this._elements.length;
      resolve();
    })
      .then(() => {
        this._loadedElementsNumber = 0;
        this._analyzeDOM();
      });
  }

  /**
   * Number of DOM elements on page
   *
   * @returns {Number}
   */
  getElementsNumber() {
    return this._elementsNumber;
  }

  /**
   * Number of DOM elements loaded
   *
   * @returns {number}
   */
  getLoadedElementsNumber() {
    return this._loadedElementsNumber;
  }

  _analyzeDOM() {
    let self = this;

    let doneLoading = () => {
      if (self._Events.has(InternalEventsList.DOM.AllElementsLoaded)) {
        self._Events.get(InternalEventsList.DOM.AllElementsLoaded)(self);
      }
    };

    if (self._elementsNumber === 0) {
      return doneLoading();
    }

    let elementLoaded = (element) => {
      self._loadedElementsNumber += 1;

      if (self._Events.has(InternalEventsList.DOM.ElementLoaded)) {
        self._Events.get(InternalEventsList.DOM.ElementLoaded)(element, self);
      }

      if (self._Events.has(InternalEventsList.DOM.ElementsLoadingPercentageIncremented)) {
        const percentageLoaded = ((100 / self._elementsNumber * self._loadedElementsNumber) << 0);
        self._Events.get(InternalEventsList.DOM.ElementsLoadingPercentageIncremented)(percentageLoaded, element, self);
      }

      if (self._loadedElementsNumber === self._elementsNumber) {
        return doneLoading();
      }
    };

    for (let i = self._elementsNumber; i--;) {
      let callback = () => {
        return elementLoaded(self._elements[i]);
      };

      let callback2 = (a, b) => {
        console.log('TEST A', a);
        console.log('TEST B', b);
        return elementLoaded(self._elements[i]);
      };

      switch (self._elements[i].tagName) {
        case 'BODY':
          self._elements[i].onload = callback;
          break;
        case 'IMG':
          let TempImage = new Image();
          TempImage.onload = callback;
          TempImage.onerror = callback;
          //TempImage.onreadystatechange = callback2;
          TempImage.src = self._elements[i].src;

          /*const imageIsCompletelyLoaded = (Image) => {
            Image.src = self._elements[i].src;
            setTimeout(() => {
              if(Image.complete) {
                return true;
              }
            }, 100);
          };

          imageIsCompletelyLoaded(TempImage);*/

          break;
        default:
          callback(self._elements[i]);
          break;
      }
    }
  }

  hasErrors() {
    return (this.Errors.length > 0);
  }

  getAllErrors() {
    return this.Errors;
  }

}