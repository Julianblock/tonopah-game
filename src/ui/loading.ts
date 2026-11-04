const SILHOUETTE = `<svg class="silhouette" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M60 18c-3-1-5-3-6-6-6-1-14-2-22-6-6-3-12-5-20-6 4 3 7 4 9 6-3 0-6 1-9 1 5 2 10 3 14 4 6 2 13 5 20 7l2 6 4-3 2 3 3-5c7-2 14-5 20-7 4-1 9-2 14-4-3 0-6-1-9-1 2-2 5-3 9-6-8 1-14 3-20 6-8 4-16 5-22 6-1 3-3 5-6 6z" fill="#ffb27a" opacity=".92"/>
<path d="M90 64l7-24m11 24l-7-24m-9 18h14m-12-7h10m-8-6h6m-9 13 12-7m-11 0 10-6m-3-6 9 22m-9-22h6" stroke="#ffb27a" stroke-width="1.8" stroke-linecap="round" opacity=".55"/>
<circle cx="99" cy="38" r="3.2" stroke="#ffb27a" stroke-width="1.6" opacity=".55"/>
</svg>`;

/** Title card shown while terrain, imagery and land cover stream in. */
export class LoadingScreen {
  readonly root = document.createElement('div');
  private bar: HTMLElement;
  private status: HTMLElement;

  constructor() {
    this.root.className = 'loading';
    this.root.innerHTML = `<div class="inner">${SILHOUETTE}
      <div class="eyebrow">Tonopah · Nevada · Elev. 6,047 ft</div>
      <div class="title">Queen of the <em>Silver Camps</em></div>
      <p class="lede">A 1900 silver boomtown halfway between Las Vegas and Reno, its headframes still standing on the hills above Main Street. Check in at the haunted Mizpah, don't look the clowns in the eye, and take to the high desert air.</p>
      <div class="bar"><i></i></div><div class="status">Preparing</div></div>`;
    this.bar = this.root.querySelector('.bar i')!;
    this.status = this.root.querySelector('.status')!;
  }

  progress(label: string, f: number) {
    this.bar.style.width = `${Math.round(f * 100)}%`;
    this.status.textContent = label;
  }

  done() {
    this.progress('Ready', 1);
    this.root.classList.add('done');
    setTimeout(() => this.root.remove(), 1600);
  }
}
