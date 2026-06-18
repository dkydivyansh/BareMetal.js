// @vitest-environment jsdom

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { virtualize } from '../src/virtualize.js';

describe('Virtualizer', () => {
  let container;

  beforeEach(() => {
    // Setup a mock container in JSDOM
    container = document.createElement('div');
    container.id = 'virtual-container';
    // Mock the scrollTop property so we can artificially scroll it in tests
    Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should initialize and create inner wrapper with correct height', () => {
    const items = new Array(100).fill(0);
    const renderRow = (item, index) => {
      const div = document.createElement('div');
      div.innerText = `Item ${index}`;
      return div;
    };

    const v = virtualize('virtual-container', items, renderRow, 50, 10);
    
    expect(v.totalHeight).toBe(5000); // 100 items * 50px
    expect(v.innerWrapper.style.height).toBe('5000px');
    // Should render 0 to 14 (visibleCount 10 + 4 buffer) = 15 items
    expect(v.innerWrapper.children.length).toBe(15);
  });

  it('should update rendered nodes on scroll', () => {
    const items = new Array(100).fill(0);
    const renderRow = () => document.createElement('div');

    const v = virtualize('virtual-container', items, renderRow, 50, 10);
    
    // Simulate scrolling down 500px (10 items)
    container.scrollTop = 500;
    // Buffer is -2, so startIndex = 10 - 2 = 8
    v.onScroll();

    expect(v.startIndex).toBe(8);
  });
});
