export default class PageInfoTime {

  constructor() {
    const now = new Date();
    this._startTimestamp = now.getTime();
    this._DOMLoadedTimestamp = 0; // DOM not loaded yet
    this._elapsedTimeToLoadDOM = 0;  // DOM not loaded yet

    window.document.addEventListener('DOMContentLoaded', () => {
      this._calculateElapsedTimeToLoadDOM();
    }, false);
  }

  /**
   * Returns the script start time
   *
   * @returns {number} The number of milliseconds between midnight, January 1, 1970 Universal Coordinated Time (UTC) (or GMT) and now.
   */
  getStartTimestamp() {
    return this._startTimestamp;
  }

  /**
   * Returns the timestamp when DOM loading finished.
   *
   * @returns {number} The number of milliseconds between midnight, January 1, 1970 Universal Coordinated Time (UTC) (or GMT) and the DOM Loaded date.
   */
  getDOMLoadedTimestamp() {
    return this._DOMLoadedTimestamp;
  }

  /**
   * Returns the milliseconds of execution needed to load the DOM.
   *
   * @returns {number}
   */
  getElapsedTimeToLoadDOM() {
    return this._elapsedTimeToLoadDOM;
  }

  _calculateElapsedTimeToLoadDOM() {
    const now = new Date();
    this._DOMLoadedTimestamp = now.getTime();
    this._elapsedTimeToLoadDOM = this._DOMLoadedTimestamp - this._startTimestamp;
  }
};