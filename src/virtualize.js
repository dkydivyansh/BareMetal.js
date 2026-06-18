export class Virtualizer {
  constructor(containerId, items, renderRow, itemHeight, visibleCount = 20) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.items = items;
    this.renderRow = renderRow;
    this.itemHeight = itemHeight;
    this.visibleCount = visibleCount;

    this.totalHeight = this.items.length * this.itemHeight;
    this.container.style.overflowY = 'auto';
    this.container.style.position = 'relative';

    this.innerWrapper = document.createElement('div');
    this.innerWrapper.style.height = `${this.totalHeight}px`;
    this.innerWrapper.style.position = 'relative';
    this.container.appendChild(this.innerWrapper);

    this.startIndex = 0;
    this.onScroll = this.onScroll.bind(this);
    this.container.addEventListener('scroll', this.onScroll);
    this.render();
  }

  onScroll() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - 2);
    if (startIndex !== this.startIndex) {
      this.startIndex = startIndex;
      this.render();
    }
  }

  render() {
    this.innerWrapper.innerHTML = '';
    const endIndex = Math.min(this.items.length - 1, this.startIndex + this.visibleCount + 4);

    for (let i = this.startIndex; i <= endIndex; i++) {
      const node = this.renderRow(this.items[i], i);
      node.style.position = 'absolute';
      node.style.top = `${i * this.itemHeight}px`;
      node.style.width = '100%';
      this.innerWrapper.appendChild(node);
    }
  }

  destroy() {
    if (this.container) {
      this.container.removeEventListener('scroll', this.onScroll);
      this.container.innerHTML = '';
    }
  }
}

export const virtualize = (containerId, items, renderRow, itemHeight, visibleCount) => {
  return new Virtualizer(containerId, items, renderRow, itemHeight, visibleCount);
};
