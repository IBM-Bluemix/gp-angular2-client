import { Directive, Input, ElementRef, OnInit, ViewContainerRef } from '@angular/core';
import { GpTranslateService } from './gp-translate.service';

@Directive({
    selector: '[gptranslate]'
})

export class GpTranslateDirective implements OnInit {
  private _key: string;
  private _bundle: string;
  private _lang: string;
  private _params: any;
  private _parentcomponent: any;

  constructor(private gpTranslateService: GpTranslateService, private element: ElementRef, private vcRef: ViewContainerRef) {
    try {
      this._parentcomponent =  this.vcRef[ '_data' ].viewContainer['_view'].component;
    } catch (e) {
      console.log("Invalid component")
    }
  }

  @Input() set gptranslate(key: string) {
    this._key = key;
  }

  get bundle() {
    return this._bundle;
  }

  @Input() set bundle(bundle: any) {
    this._bundle = bundle;
   }

   get lang() {
     return this._lang;
   }

  @Input() set lang(lang: any) {
    this._lang = lang;
  }

  @Input() set formatparams(params: any) {
    this._params = params;
  }

  getText(actualKey?:string) {
    let nodes: Node[] = this.element.nativeElement.childNodes;
    if (nodes.length == 0 && this._key) {
      this.getTranslation(this._key).then((value) => {
        this.interpolatedText(value).then((data) => this.element.nativeElement.textContent = data) ;
      });
      return;
    }
    for (let node of nodes) {
      if (node.nodeType == 3) { // node type 3 is always text node
        this._key = node.textContent;
        this.getTranslation(this._key).then((value) => {
          this.interpolatedText(value).then((data)=> {node.textContent = data});
        });
      }
    }
  }

  interpolatedText(originaltext: string): Promise<any> {
    if (!this._params)
      return Promise.resolve(originaltext);
    let paramMap = this._params;
    let promises = []
    for (let key in paramMap) {
      let keyText = paramMap[key];
      let translatedText = keyText;
      promises.push(this.parse(key, keyText));
    }
    return Promise.all(promises)
      .then((results) => {
              for (let k in results) {
                let replaceStr = "{"+results[k][0]+"}";
                if (originaltext)
                  originaltext = originaltext.replace(replaceStr, results[k][1]);
              }
              return originaltext;
            },
          (error) => console.log("Error occurred")
    )
    .catch((e) => {
        console.log("Failed to interpolate text", e);
    });
  }

  parse(key: string, text: string): Promise<any> {
     let templateMatcher: RegExp = /{\s?([^{}\s]*)\s?}/g;
     let match = templateMatcher.exec(text);
     if (match) {
       let modkey = match[1];
       return this.getTranslation(modkey).then((data) => {
          return Promise.resolve([modkey, data]);
       })
     }
     return Promise.resolve([key, text]);
  }

  getTranslation(key: string) {
    let bundle = this.gpTranslateService.getConfig().defaultBundle;
    if (this._parentcomponent && this._parentcomponent.bundle) {
      bundle = this._parentcomponent.bundle;
    }
    if (this._bundle) {
      bundle = this._bundle;
    }
    let lang = this.gpTranslateService.getConfig().defaultLang;
    if (this._parentcomponent && this._parentcomponent.lang) {
      lang = this._parentcomponent.lang;
    }
    if (this._lang) {
      lang = this._lang;
    }
    return this.gpTranslateService.getTranslation(key, bundle, lang)
          .then((resourceMap) => {
            if (key in resourceMap) {
              return resourceMap[key];
            }
          });
  }

  ngOnInit() {
    this.getText();
  }
}
