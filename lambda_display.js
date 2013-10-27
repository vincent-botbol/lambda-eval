// This program was compiled from OCaml by js_of_ocaml 1.3
function caml_raise_with_arg (tag, arg) { throw [0, tag, arg]; }
function caml_raise_with_string (tag, msg) {
  caml_raise_with_arg (tag, new MlWrappedString (msg));
}
function caml_invalid_argument (msg) {
  caml_raise_with_string(caml_global_data[4], msg);
}
function caml_array_bound_error () {
  caml_invalid_argument("index out of bounds");
}
function caml_str_repeat(n, s) {
  if (!n) { return ""; }
  if (n & 1) { return caml_str_repeat(n - 1, s) + s; }
  var r = caml_str_repeat(n >> 1, s);
  return r + r;
}
function MlString(param) {
  if (param != null) {
    this.bytes = this.fullBytes = param;
    this.last = this.len = param.length;
  }
}
MlString.prototype = {
  string:null,
  bytes:null,
  fullBytes:null,
  array:null,
  len:null,
  last:0,
  toJsString:function() {
    return this.string = decodeURIComponent (escape(this.getFullBytes()));
  },
  toBytes:function() {
    if (this.string != null)
      var b = unescape (encodeURIComponent (this.string));
    else {
      var b = "", a = this.array, l = a.length;
      for (var i = 0; i < l; i ++) b += String.fromCharCode (a[i]);
    }
    this.bytes = this.fullBytes = b;
    this.last = this.len = b.length;
    return b;
  },
  getBytes:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return b;
  },
  getFullBytes:function() {
    var b = this.fullBytes;
    if (b !== null) return b;
    b = this.bytes;
    if (b == null) b = this.toBytes ();
    if (this.last < this.len) {
      this.bytes = (b += caml_str_repeat(this.len - this.last, '\0'));
      this.last = this.len;
    }
    this.fullBytes = b;
    return b;
  },
  toArray:function() {
    var b = this.bytes;
    if (b == null) b = this.toBytes ();
    var a = [], l = this.last;
    for (var i = 0; i < l; i++) a[i] = b.charCodeAt(i);
    for (l = this.len; i < l; i++) a[i] = 0;
    this.string = this.bytes = this.fullBytes = null;
    this.last = this.len;
    this.array = a;
    return a;
  },
  getArray:function() {
    var a = this.array;
    if (!a) a = this.toArray();
    return a;
  },
  getLen:function() {
    var len = this.len;
    if (len !== null) return len;
    this.toBytes();
    return this.len;
  },
  toString:function() { var s = this.string; return s?s:this.toJsString(); },
  valueOf:function() { var s = this.string; return s?s:this.toJsString(); },
  blitToArray:function(i1, a2, i2, l) {
    var a1 = this.array;
    if (a1) {
      if (i2 <= i1) {
        for (var i = 0; i < l; i++) a2[i2 + i] = a1[i1 + i];
      } else {
        for (var i = l - 1; i >= 0; i--) a2[i2 + i] = a1[i1 + i];
      }
    } else {
      var b = this.bytes;
      if (b == null) b = this.toBytes();
      var l1 = this.last - i1;
      if (l <= l1)
        for (var i = 0; i < l; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
      else {
        for (var i = 0; i < l1; i++) a2 [i2 + i] = b.charCodeAt(i1 + i);
        for (; i < l; i++) a2 [i2 + i] = 0;
      }
    }
  },
  get:function (i) {
    var a = this.array;
    if (a) return a[i];
    var b = this.bytes;
    if (b == null) b = this.toBytes();
    return (i<this.last)?b.charCodeAt(i):0;
  },
  safeGet:function (i) {
    if (!this.len) this.toBytes();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    return this.get(i);
  },
  set:function (i, c) {
    var a = this.array;
    if (!a) {
      if (this.last == i) {
        this.bytes += String.fromCharCode (c & 0xff);
        this.last ++;
        return 0;
      }
      a = this.toArray();
    } else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    a[i] = c & 0xff;
    return 0;
  },
  safeSet:function (i, c) {
    if (this.len == null) this.toBytes ();
    if ((i < 0) || (i >= this.len)) caml_array_bound_error ();
    this.set(i, c);
  },
  fill:function (ofs, len, c) {
    if (ofs >= this.last && this.last && c == 0) return;
    var a = this.array;
    if (!a) a = this.toArray();
    else if (this.bytes != null) {
      this.bytes = this.fullBytes = this.string = null;
    }
    var l = ofs + len;
    for (var i = ofs; i < l; i++) a[i] = c;
  },
  compare:function (s2) {
    if (this.string != null && s2.string != null) {
      if (this.string < s2.string) return -1;
      if (this.string > s2.string) return 1;
      return 0;
    }
    var b1 = this.getFullBytes ();
    var b2 = s2.getFullBytes ();
    if (b1 < b2) return -1;
    if (b1 > b2) return 1;
    return 0;
  },
  equal:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string == s2.string;
    return this.getFullBytes () == s2.getFullBytes ();
  },
  lessThan:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string < s2.string;
    return this.getFullBytes () < s2.getFullBytes ();
  },
  lessEqual:function (s2) {
    if (this.string != null && s2.string != null)
      return this.string <= s2.string;
    return this.getFullBytes () <= s2.getFullBytes ();
  }
}
function MlWrappedString (s) { this.string = s; }
MlWrappedString.prototype = new MlString();
function MlMakeString (l) { this.bytes = ""; this.len = l; }
MlMakeString.prototype = new MlString ();
function caml_blit_string(s1, i1, s2, i2, len) {
  if (len === 0) return;
  if (i2 === s2.last && s2.bytes != null) {
    var b = s1.bytes;
    if (b == null) b = s1.toBytes ();
    if (i1 > 0 || s1.last > len) b = b.slice(i1, i1 + len);
    s2.bytes += b;
    s2.last += b.length;
    return;
  }
  var a = s2.array;
  if (!a) a = s2.toArray(); else { s2.bytes = s2.string = null; }
  s1.blitToArray (i1, a, i2, len);
}
function caml_call_gen(f, args) {
  if(f.fun)
    return caml_call_gen(f.fun, args);
  var n = f.length;
  var d = n - args.length;
  if (d == 0)
    return f.apply(null, args);
  else if (d < 0)
    return caml_call_gen(f.apply(null, args.slice(0,n)), args.slice(n));
  else
    return function (x){ return caml_call_gen(f, args.concat([x])); };
}
function caml_int64_compare(x,y) {
  var x3 = x[3] << 16;
  var y3 = y[3] << 16;
  if (x3 > y3) return 1;
  if (x3 < y3) return -1;
  if (x[2] > y[2]) return 1;
  if (x[2] < y[2]) return -1;
  if (x[1] > y[1]) return 1;
  if (x[1] < y[1]) return -1;
  return 0;
}
function caml_int_compare (a, b) {
  if (a < b) return (-1); if (a == b) return 0; return 1;
}
function caml_compare_val (a, b, total) {
  var stack = [];
  for(;;) {
    if (!(total && a === b)) {
      if (a instanceof MlString) {
        if (b instanceof MlString) {
            if (a != b) {
		var x = a.compare(b);
		if (x != 0) return x;
	    }
        } else
          return 1;
      } else if (a instanceof Array && a[0] === (a[0]|0)) {
        var ta = a[0];
        if (ta === 250) {
          a = a[1];
          continue;
        } else if (b instanceof Array && b[0] === (b[0]|0)) {
          var tb = b[0];
          if (tb === 250) {
            b = b[1];
            continue;
          } else if (ta != tb) {
            return (ta < tb)?-1:1;
          } else {
            switch (ta) {
            case 248: {
		var x = caml_int_compare(a[2], b[2]);
		if (x != 0) return x;
		break;
	    }
            case 255: {
		var x = caml_int64_compare(a, b);
		if (x != 0) return x;
		break;
	    }
            default:
              if (a.length != b.length) return (a.length < b.length)?-1:1;
              if (a.length > 1) stack.push(a, b, 1);
            }
          }
        } else
          return 1;
      } else if (b instanceof MlString ||
                 (b instanceof Array && b[0] === (b[0]|0))) {
        return -1;
      } else {
        if (a < b) return -1;
        if (a > b) return 1;
        if (total && a != b) {
          if (a == a) return 1;
          if (b == b) return -1;
        }
      }
    }
    if (stack.length == 0) return 0;
    var i = stack.pop();
    b = stack.pop();
    a = stack.pop();
    if (i + 1 < a.length) stack.push(a, b, i + 1);
    a = a[i];
    b = b[i];
  }
}
function caml_compare (a, b) { return caml_compare_val (a, b, true); }
function caml_create_string(len) {
  if (len < 0) caml_invalid_argument("String.create");
  return new MlMakeString(len);
}
function caml_equal (x, y) { return +(caml_compare_val(x,y,false) == 0); }
function caml_fill_string(s, i, l, c) { s.fill (i, l, c); }
function caml_greaterequal (x, y) { return +(caml_compare(x,y,false) >= 0); }
var caml_js_regexps = { amp:/&/g, lt:/</g, quot:/\"/g, all:/[&<\"]/ };
function caml_js_html_escape (s) {
  if (!caml_js_regexps.all.test(s)) return s;
  return s.replace(caml_js_regexps.amp, "&amp;")
          .replace(caml_js_regexps.lt, "&lt;")
          .replace(caml_js_regexps.quot, "&quot;");
}
function caml_js_wrap_callback(f) {
  var toArray = Array.prototype.slice;
  return function () {
    var args = (arguments.length > 0)?toArray.call (arguments):[undefined];
    return caml_call_gen(f, args);
  }
}
function caml_lessequal (x, y) { return +(caml_compare(x,y,false) <= 0); }
function caml_lessthan (x, y) { return +(caml_compare(x,y,false) < 0); }
function caml_ml_flush () { return 0; }
function caml_ml_open_descriptor_out () { return 0; }
function caml_ml_out_channels_list () { return 0; }
function caml_ml_output () { return 0; }
function caml_mul(x,y) {
  return ((((x >> 16) * y) << 16) + (x & 0xffff) * y)|0;
}
var caml_global_data = [0];
function caml_register_global (n, v) { caml_global_data[n + 1] = v; }
var caml_named_values = {};
function caml_register_named_value(nm,v) {
  caml_named_values[nm] = v; return 0;
}
function caml_string_equal(s1, s2) {
  var b1 = s1.fullBytes;
  var b2 = s2.fullBytes;
  if (b1 != null && b2 != null) return (b1 == b2)?1:0;
  return (s1.getFullBytes () == s2.getFullBytes ())?1:0;
}
function caml_string_notequal(s1, s2) { return 1-caml_string_equal(s1, s2); }
function caml_sys_get_config () {
  return [0, new MlWrappedString("Unix"), 32, 0];
}
(function(){function dh(mp,mq,mr,ms){return mp.length==3?mp(mq,mr,ms):caml_call_gen(mp,[mq,mr,ms]);}function cr(mm,mn,mo){return mm.length==2?mm(mn,mo):caml_call_gen(mm,[mn,mo]);}function bT(mk,ml){return mk.length==1?mk(ml):caml_call_gen(mk,[ml]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=[0,new MlString("Not_found")],d=[0,new MlString("Assert_failure")],e=[0,[0,new MlString("...")],0];caml_register_global(6,c);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var bu=new MlString("output"),bt=new MlString("Pervasives.do_at_exit"),bs=new MlString("nth"),br=new MlString("List.nth"),bq=new MlString("String.blit"),bp=new MlString("Buffer.add_substring"),bo=new MlString("Buffer.add: cannot grow buffer"),bn=[3,0,3],bm=new MlString("."),bl=new MlString(">"),bk=new MlString("</"),bj=new MlString(">"),bi=new MlString("<"),bh=new MlString("\n"),bg=new MlString("Format.Empty_queue"),bf=[0,new MlString("")],be=new MlString("\""),bd=new MlString(" name=\""),bc=new MlString("\""),bb=new MlString(" type=\""),ba=new MlString("<"),a$=new MlString(">"),a_=new MlString(""),a9=new MlString("<input name=\"x\">"),a8=new MlString("input"),a7=new MlString("x"),a6=new MlString("select"),a5=new MlString("input"),a4=new MlString("div"),a3=new MlString("canvas"),a2=new MlString("button"),a1=new MlString("a"),a0=new MlString("br"),aZ=new MlString("input"),aY=new MlString("select"),aX=new MlString("option"),aW=new MlString("2d"),aV=[0,new MlString("Infinite loop detected")],aU=new MlString("'"),aT=new MlString(" "),aS=new MlString(")"),aR=new MlString("("),aQ=new MlString("\xce\xbb"),aP=new MlString(")"),aO=new MlString("("),aN=new MlString("nth"),aM=new MlString("cannot retrieve"),aL=new MlString("."),aK=new MlString("parse"),aJ=new MlString("("),aI=new MlString(")"),aH=new MlString("."),aG=new MlString("l"),aF=new MlString("parse"),aE=new MlString(")"),aD=new MlString("parse"),aC=[0,0,0],aB=new MlString("."),aA=[0,new MlString("l"),[0,new MlString("("),[0,new MlString(")"),0]]],az=new MlString("parse"),ay=new MlString("parse"),ax=new MlString("parse"),aw=[0,new MlString(" "),[0,new MlString("\t"),[0,new MlString("\n"),0]]],av=[0,new MlString("l"),[0,new MlString("."),[0,new MlString("("),[0,new MlString(")"),0]]]],au=new MlString("'"),at=new MlString("lex"),as=new MlString("'"),ar=new MlString(""),aq=new MlString("labcd.ab(adc)"),ap=new MlString("J"),ao=new MlString("lxy.y"),an=new MlString("F"),am=new MlString("lxy.x"),al=new MlString("T"),ak=new MlString("lf.(lx.f(xx))(lx.f(xx))"),aj=new MlString("Y"),ai=new MlString("lxyz.xzy"),ah=new MlString("C"),ag=new MlString("lxyz.x(yz)"),af=new MlString("B"),ae=new MlString("lxyz.(xz)(yz)"),ad=new MlString("S"),ac=new MlString("lxy.x"),ab=new MlString("K"),aa=new MlString("lx.x"),$=new MlString("I"),_=new MlString("Lambda.Normal"),Z=new MlString("Lambda.Irreductible"),Y=new MlString("#"),X=new MlString(" - "),W=[0,new MlString("Appel par valeur")],V=new MlString("(lxy.yx)((lx.x) 1) (lx.x)"),U=[0,new MlString("Appel par nom")],T=new MlString("(lxy.yx)((lx.x) 1) (lx.x)"),S=[0,new MlString("Terme irreductible")],R=new MlString("(lx.xx)(lx.xx)"),Q=new MlString("(KISS)(KISS)"),P=new MlString("(lx.f x) a"),O=new MlString("cbn"),N=new MlString("cbv"),M=[0,new MlString("lambda_display.ml"),216,13],L=new MlString("submit"),K=new MlString("submit"),J=new MlString("Prev"),I=new MlString("Next"),H=new MlString("250px"),G=new MlString("10px"),F=new MlString("block"),E=new MlString("#FFFFFF"),D=new MlString("#FF0000"),C=new MlString("#0000FF"),B=new MlString("#006400"),A=new MlString("#FFA000"),z=[0,0,0],y=[0,new MlString("lambda_display.ml"),66,34],x=[0,new MlString("lambda_display.ml"),64,34],w=[0,new MlString("lambda_display.ml"),62,37],v=[0,new MlString("lambda_display.ml"),59,37],u=[0,new MlString("lambda_display.ml"),57,37],t=[0,new MlString("lambda_display.ml"),55,36],s=new MlString("app"),r=new MlString("\xce\xbb"),q=new MlString("nth"),p=new MlString("?"),o=new MlString("MonQ"),n=new MlString("MonB"),m=new MlString("MonC"),l=new MlString("MonS"),k=new MlString("MonP"),j=new MlString("examples"),i=new MlString("(KISS)(KISS)");function h(f){throw [0,a,f];}function bv(g){throw [0,b,g];}var bG=(1<<31)-1|0;function bF(bw,by){var bx=bw.getLen(),bz=by.getLen(),bA=caml_create_string(bx+bz|0);caml_blit_string(bw,0,bA,0,bx);caml_blit_string(by,0,bA,bx,bz);return bA;}function bC(bB,bD){if(bB){var bE=bB[1];return [0,bE,bC(bB[2],bD)];}return bD;}var bQ=caml_ml_open_descriptor_out(1),bP=caml_ml_open_descriptor_out(2);function bR(bK){var bH=caml_ml_out_channels_list(0);for(;;){if(bH){var bI=bH[2];try {}catch(bJ){}var bH=bI;continue;}return 0;}}var bS=[0,bR];function bW(bO,bN,bL,bM){if(0<=bL&&0<=bM&&!((bN.getLen()-bM|0)<bL))return caml_ml_output(bO,bN,bL,bM);return bv(bu);}function bV(bU){return bT(bS[1],0);}caml_register_named_value(bt,bV);function cx(bY){var bX=0,bZ=bY;for(;;){if(bZ){var b1=bZ[2],b0=bX+1|0,bX=b0,bZ=b1;continue;}return bX;}}function cy(b3,b2){if(0<=b2){var b4=b3,b5=b2;for(;;){if(b4){var b8=b4[2],b6=b4[1];if(0!==b5){var b9=b5-1|0,b4=b8,b5=b9;continue;}var b7=b6;}else var b7=h(bs);return b7;}}return bv(br);}function cz(b_){var b$=b_,ca=0;for(;;){if(b$){var cb=b$[2],cc=[0,b$[1],ca],b$=cb,ca=cc;continue;}return ca;}}function cg(ce,cd){if(cd){var cf=cd[2],ch=bT(ce,cd[1]);return [0,ch,cg(ce,cf)];}return 0;}function cA(ck,ci){var cj=ci;for(;;){if(cj){var cl=cj[2];bT(ck,cj[1]);var cj=cl;continue;}return 0;}}function cn(cp,cm,co){if(cm){var cq=cm[1];return cr(cp,cq,cn(cp,cm[2],co));}return co;}function cB(cu,cs){var ct=cs;for(;;){if(ct){var cv=ct[2],cw=0===caml_compare(ct[1],cu)?1:0;if(cw)return cw;var ct=cv;continue;}return 0;}}function cK(cC,cE){var cD=caml_create_string(cC);caml_fill_string(cD,0,cC,cE);return cD;}function cL(cH,cG,cJ,cI,cF){if(0<=cF&&0<=cG&&!((cH.getLen()-cF|0)<cG)&&0<=cI&&!((cJ.getLen()-cF|0)<cI))return caml_blit_string(cH,cG,cJ,cI,cF);return bv(bq);}var cM=caml_sys_get_config(0)[2],cN=caml_mul(cM/8|0,(1<<(cM-10|0))-1|0)-1|0,cY=[0,0];function c5(cU,cT,cO,cR){var cP=cO<0?1:0;if(cP)var cQ=cP;else{var cS=cR<0?1:0,cQ=cS?cS:(cT.getLen()-cR|0)<cO?1:0;}if(cQ)bv(bp);var cV=cU[2]+cR|0;if(cU[3]<cV){var cW=[0,cU[3]];for(;;){if(cW[1]<(cU[2]+cR|0)){cW[1]=2*cW[1]|0;continue;}if(cN<cW[1])if((cU[2]+cR|0)<=cN)cW[1]=cN;else h(bo);var cX=caml_create_string(cW[1]);cL(cU[1],0,cX,0,cU[2]);cU[1]=cX;cU[3]=cW[1];break;}}cL(cT,cO,cU[1],cU[2],cR);cU[2]=cV;return 0;}function c4(cZ,c1){var c0=[0,[0,cZ,0]],c2=c1[1];if(c2){var c3=c2[1];c1[1]=c0;c3[2]=c0;return 0;}c1[1]=c0;c1[2]=c0;return 0;}var c6=[0,bg];function dc(c7){var c8=c7[2];if(c8){var c9=c8[1],c_=c9[2],c$=c9[1];c7[2]=c_;if(0===c_)c7[1]=0;return c$;}throw [0,c6];}function dd(db,da){db[13]=db[13]+da[3]|0;return c4(da,db[27]);}var de=1000000010;function ec(dg,df){return dh(dg[17],df,0,df.getLen());}function dl(di){return bT(di[19],0);}function dt(dj,dk){return bT(dj[20],dk);}function du(dm,dp,dn){dl(dm);dm[11]=1;var dq=(dm[6]-dn|0)+dp|0,dr=dm[8],ds=caml_lessequal(dr,dq)?dr:dq;dm[10]=ds;dm[9]=dm[6]-dm[10]|0;return dt(dm,dm[10]);}function d9(dw,dv){return du(dw,0,dv);}function dO(dx,dy){dx[9]=dx[9]-dy|0;return dt(dx,dy);}function ew(dz){try {for(;;){var dA=dz[27][2];if(!dA)throw [0,c6];var dB=dA[1][1],dC=dB[1],dD=dB[2],dE=dC<0?1:0,dG=dB[3],dF=dE?(dz[13]-dz[12]|0)<dz[9]?1:0:dE,dH=1-dF;if(dH){dc(dz[27]);var dI=0<=dC?dC:de;if(typeof dD==="number")switch(dD){case 1:var ee=dz[2];if(ee)dz[2]=ee[2];break;case 2:var ef=dz[3];if(ef)dz[3]=ef[2];break;case 3:var eg=dz[2];if(eg)d9(dz,eg[1][2]);else dl(dz);break;case 4:if(dz[10]!==(dz[6]-dz[9]|0)){var eh=dc(dz[27]),ei=eh[1];dz[12]=dz[12]-eh[3]|0;dz[9]=dz[9]+ei|0;}break;case 5:var ej=dz[5];if(ej){var ek=ej[2];ec(dz,bT(dz[24],ej[1]));dz[5]=ek;}break;default:var el=dz[3];if(el){var em=el[1][1],eq=function(ep,en){if(en){var eo=en[1],er=en[2];return caml_lessthan(ep,eo)?[0,ep,en]:[0,eo,eq(ep,er)];}return [0,ep,0];};em[1]=eq(dz[6]-dz[9]|0,em[1]);}}else switch(dD[0]){case 1:var dJ=dD[2],dK=dD[1],dL=dz[2];if(dL){var dM=dL[1],dN=dM[2];switch(dM[1]){case 1:du(dz,dJ,dN);break;case 2:du(dz,dJ,dN);break;case 3:if(dz[9]<dI)du(dz,dJ,dN);else dO(dz,dK);break;case 4:if(dz[11])dO(dz,dK);else if(dz[9]<dI)du(dz,dJ,dN);else if(((dz[6]-dN|0)+dJ|0)<dz[10])du(dz,dJ,dN);else dO(dz,dK);break;case 5:dO(dz,dK);break;default:dO(dz,dK);}}break;case 2:var dP=dz[6]-dz[9]|0,dQ=dz[3],d2=dD[2],d1=dD[1];if(dQ){var dR=dQ[1][1],dS=dR[1];if(dS){var dY=dS[1];try {var dT=dR[1];for(;;){if(!dT)throw [0,c];var dU=dT[1],dW=dT[2];if(!caml_greaterequal(dU,dP)){var dT=dW;continue;}var dV=dU;break;}}catch(dX){if(dX[1]!==c)throw dX;var dV=dY;}var dZ=dV;}else var dZ=dP;var d0=dZ-dP|0;if(0<=d0)dO(dz,d0+d1|0);else du(dz,dZ+d2|0,dz[6]);}break;case 3:var d3=dD[2],d_=dD[1];if(dz[8]<(dz[6]-dz[9]|0)){var d4=dz[2];if(d4){var d5=d4[1],d6=d5[2],d7=d5[1],d8=dz[9]<d6?0===d7?0:5<=d7?1:(d9(dz,d6),1):0;d8;}else dl(dz);}var ea=dz[9]-d_|0,d$=1===d3?1:dz[9]<dI?d3:5;dz[2]=[0,[0,d$,ea],dz[2]];break;case 4:dz[3]=[0,dD[1],dz[3]];break;case 5:var eb=dD[1];ec(dz,bT(dz[23],eb));dz[5]=[0,eb,dz[5]];break;default:var ed=dD[1];dz[9]=dz[9]-dI|0;ec(dz,ed);dz[11]=0;}dz[12]=dG+dz[12]|0;continue;}break;}}catch(es){if(es[1]===c6)return 0;throw es;}return dH;}function ex(ev,eu,et){return [0,ev,eu,et];}var ey=[0,[0,-1,ex(-1,bf,0)],0];function eG(ez){ez[1]=ey;return 0;}function eN(eA,eI){var eB=eA[1];if(eB){var eC=eB[1],eD=eC[2],eE=eD[1],eF=eB[2],eH=eD[2];if(eC[1]<eA[12])return eG(eA);if(typeof eH!=="number")switch(eH[0]){case 1:case 2:var eJ=eI?(eD[1]=eA[13]+eE|0,eA[1]=eF,0):eI;return eJ;case 3:var eK=1-eI,eL=eK?(eD[1]=eA[13]+eE|0,eA[1]=eF,0):eK;return eL;default:}return 0;}return 0;}function eY(eM,eV){var eO=0;for(;;){if(1<eM[14]){if(1<eM[14]){if(eM[14]<eM[15]){dd(eM,[0,0,1,0]);eN(eM,1);eN(eM,0);}eM[14]=eM[14]-1|0;}continue;}eM[13]=de;ew(eM);if(eO)dl(eM);eM[12]=1;eM[13]=1;var eP=eM[27];eP[1]=0;eP[2]=0;eG(eM);eM[2]=0;eM[3]=0;eM[4]=0;eM[5]=0;eM[10]=0;eM[14]=0;eM[9]=eM[6];eM[14]=eM[14]+1|0;var eQ=3,eR=0;if(eM[14]<eM[15]){var eS=ex(-eM[13]|0,[3,eR,eQ],0);dd(eM,eS);if(0)eN(eM,1);eM[1]=[0,[0,eM[13],eS],eM[1]];}else if(eM[14]===eM[15]){var eT=eM[16],eU=eT.getLen();dd(eM,ex(eU,[0,eT],eU));ew(eM);}return bT(eM[18],0);}}function e0(eW,eX){return dh(eW[17],bh,0,1);}var eZ=cK(80,32);function fj(e4,e1){var e2=e1;for(;;){var e3=0<e2?1:0;if(e3){if(80<e2){dh(e4[17],eZ,0,80);var e5=e2-80|0,e2=e5;continue;}return dh(e4[17],eZ,0,e2);}return e3;}}function ff(e6){return bF(bi,bF(e6,bj));}function fe(e7){return bF(bk,bF(e7,bl));}function fd(e8){return 0;}function fn(fh,fg){function e$(e9){return 0;}var fa=[0,0,0];function fc(e_){return 0;}var fb=ex(-1,bn,0);c4(fb,fa);var fi=[0,[0,[0,1,fb],ey],0,0,0,0,78,10,78-10|0,78,0,1,1,1,1,bG,bm,fh,fg,fc,e$,0,0,ff,fe,fd,fd,fa];fi[19]=bT(e0,fi);fi[20]=bT(fj,fi);return fi;}function fo(fk){function fm(fl){return caml_ml_flush(fk);}return fn(bT(bW,fk),fm);}var fp=512,fq=1<=fp?fp:1,fr=cN<fq?cN:fq,fs=caml_create_string(fr),ft=fo(bQ);fo(bP);var fv=[0,fs,0,fr,fs];function fw(fu){return 0;}fn(bT(c5,fv),fw);var fx=bT(eY,ft),fy=bS[1];bS[1]=function(fz){bT(fx,0);return bT(fy,0);};var fA=null,fH=undefined;function fG(fB,fD,fE){var fC=fB==fA?fA:bT(fD,fB),fF=fC==fA?bT(fE,fB):fC;return fF;}var fI=true,fJ=Array;function fL(fK){return fK instanceof fJ?0:[0,new MlWrappedString(fK.toString())];}cY[1]=[0,fL,cY[1]];function fN(fM){return fM;}function fV(fO,fP){fO.appendChild(fP);return 0;}function fW(fR){return fN(caml_js_wrap_callback(function(fQ){if(fQ){var fS=bT(fR,fQ);if(!(fS|0))fQ.preventDefault();return fS;}var fT=event,fU=bT(fR,fT);fT.returnValue=fU;return fU;}));}var fX=this,f7=aW.toString(),f6=fX.document;function f5(fY,fZ){return fY?bT(fZ,fY[1]):0;}function f2(f1,f0){return f1.createElement(f0.toString());}function f8(f4,f3){return f2(f4,f3);}var f9=[0,785140586];function gq(f_,f$,gb,ga){for(;;){if(0===f_&&0===f$)return f2(gb,ga);var gc=f9[1];if(785140586===gc){try {var gd=f6.createElement(a9.toString()),ge=a8.toString(),gf=gd.tagName.toLowerCase()===ge?1:0,gg=gf?gd.name===a7.toString()?1:0:gf,gh=gg;}catch(gj){var gh=0;}var gi=gh?982028505:-1003883683;f9[1]=gi;continue;}if(982028505<=gc){var gk=new fJ();gk.push(ba.toString(),ga.toString());f5(f_,function(gl){gk.push(bb.toString(),caml_js_html_escape(gl),bc.toString());return 0;});f5(f$,function(gm){gk.push(bd.toString(),caml_js_html_escape(gm),be.toString());return 0;});gk.push(a$.toString());return gb.createElement(gk.join(a_.toString()));}var gn=f2(gb,ga);f5(f_,function(go){return gn.type=go;});f5(f$,function(gp){return gn.name=gp;});return gn;}}function gu(gt,gs,gr){return gq(gt,gs,gr,aZ);}this.HTMLElement===fH;function gy(gv,gw){var gx=gv.toString();return gw.tagName.toLowerCase()===gx?fN(gw):fA;}function gE(gz){return gy(a2,gz);}function gG(gA){return gy(a3,gA);}function gF(gB){return gy(a4,gB);}function gH(gC){return gy(a5,gC);}function hE(gD){return gy(a6,gD);}function hj(gI){var gJ=gI[2];if(gJ)return [0,gJ[1]];var gK=gI[3],gL=gI[4];if(gL)return [0,gL[1]];var gM=gK?[0,gK[1]]:gK;return gM;}function hi(gN){var gO=gN[2];if(gO)return [0,gO[1]];var gP=gN[3];if(gP)return [0,gP[1]];var gQ=gN[4],gR=gQ?[0,gQ[1]]:gQ;return gR;}function gV(gS,gT){gS[5]=gS[5]+gT|0;var gU=gS[3];if(gU)gV(gU[1],gT+gS[8]|0);var gW=gS[4];if(gW)gV(gW[1],gT+gS[8]|0);return gS;}function g2(gX,g1){var gY=gX[3],gZ=gX[4];if(gY){var g0=gY[1];if(gZ){var g3=g2(g0,g1+1|0),g4=g2(gZ[1],g1+1|0);gX[6]=g1;var g5=g3,g6=g4,g7=0,g8=0,g9=0,g_=0,g$=0;for(;;){var ha=g8?g8[1]:0,hb=g9?g9[1]:0,hc=(g5[5]+ha|0)-(g6[5]+hb|0)|0;if(g7){var hd=g7[1],he=hd<hc?hc:hd,hf=he;}else var hf=hc;var hg=g_?g_[1]:g5,hh=g$?g$[1]:g6,hl=hi(hg),hk=hj(g5),hm=hi(g6),hs=hj(hh);if(hk&&hm){var hr=[0,hb+g6[7]|0],hq=[0,ha+g5[7]|0],hp=[0,hf],ho=hm[1],hn=hk[1],g5=hn,g6=ho,g7=hp,g8=hq,g9=hr,g_=hl,g$=hs;continue;}var ht=(hf+1|0)+(((g4[5]+g3[5]|0)+(hf+1|0)|0)%2|0)|0;g4[8]=ht;g4[5]=g4[5]+ht|0;var hv=g4[4];if(g4[3]||hv)var hu=0;else{var hw=hb,hu=1;}if(!hu)var hw=hb+ht|0;var hx=hk?hm?0:(hh[2]=[0,hk[1]],hh[8]=ha-hw|0,1):hm?(hg[2]=[0,hm[1]],hg[8]=hw-ha|0,1):0;hx;gX[5]=(g3[5]+g4[5]|0)/2|0;return gX;}}var hy=g0;}else{if(!gZ){gX[5]=0;gX[6]=g1;return gX;}var hy=gZ[1];}gX[5]=g2(hy,g1+1|0)[5];gX[6]=g1;return gX;}function hG(hz){return gV(g2(hz,0),0);}function hF(hA,hC,hD){var hB=[0,hA,0,0,0,0,0,0,0].slice();hB[3]=hC;hB[4]=hD;return hB;}function iC(hH){return hH;}function iD(hK,hJ,hI){return bT(hK,bT(hJ,hI));}function hN(hM,hL){if(hL)return caml_equal(hM,hL[1])?0:hN(hM,hL[2])+1|0;throw [0,c];}function iE(hO){function hQ(hP){try {var hR=cK(1,hO.safeGet(hP)),hS=[0,hR,hQ(hP+1|0)];}catch(hT){if(hT[1]===b)return 0;throw hT;}return hS;}return hQ(0);}function h5(hU){return cn(bF,hU,ar);}function iF(h8){function hZ(hV){var hW=hV;for(;;){if(hW){var hX=hW[2],hY=hW[1];if(cB(hY,aw)){var hW=hX;continue;}if(cB(hY,av))return [0,hY,hZ(hX)];if(caml_string_equal(hY,au))return h(at);var h0=[0,hY,0],h1=hX;for(;;){if(h1){var h2=h1[1];if(caml_string_equal(h2,as)){var h3=h1[2],h4=bC(h0,[0,h2,0]),h0=h4,h1=h3;continue;}var h6=hZ(h1),h7=[0,h5(h0),h6];}else var h7=[0,h5(h0),0];return h7;}}return hW;}}return hZ(h8);}function iG(iA){function is(h$,h_){var ia=h9(h$,h_),ib=ia[1],ih=ia[2];for(;;){if(ib){var ic=ib[2],id=ib[1];if(ic){var ie=[0,[1,id,ic[1]],ic[2]],ib=ie;continue;}var ig=id;}else var ig=h(aK);return [0,ig,ih];}}function h9(ik,ii){if(ii){var ij=ii[1];if(caml_string_notequal(ij,aJ)){if(caml_string_notequal(ij,aI)){if(caml_string_notequal(ij,aH)){if(caml_string_notequal(ij,aG)){try {var il=[3,hN(ij,ik)],im=il;}catch(io){if(io[1]!==c)throw io;var im=[0,ij];}var ip=h9(ik,ii[2]);return [0,[0,im,ip[1]],ip[2]];}var ir=iq(ik,ii[2]);return [0,[0,ir[1],0],ir[2]];}return h(aF);}return [0,0,ii];}var it=is(ik,ii[2]),iu=it[2];if(iu&&!caml_string_notequal(iu[1],aE)){var iv=h9(ik,iu[2]);return [0,[0,it[1],iv[1]],iv[2]];}return h(aD);}return aC;}function iq(iy,iw){if(iw){var ix=iw[1];if(caml_string_notequal(ix,aB)){if(cB(ix,aA))return h(az);var iz=iq([0,ix,iy],iw[2]);return [0,[2,ix,iz[1]],iz[2]];}return is(iy,iw[2]);}return h(ay);}var iB=is(0,iA);return 0===iB[2]?iB[1]:h(ax);}var iH=cr(iD,iG,cr(iD,iF,iE));function iQ(iP){function iJ(iK,iI){switch(iI[0]){case 1:var iL=iJ(iK,iI[2]);return [1,iJ(iK,iI[1]),iL];case 2:var iM=iI[1],iO=iI[2];for(;;){if(cB(iM,iK)){var iN=bF(iM,aU),iM=iN;continue;}return [2,iM,iJ([0,iM,iK],iO)];}default:return iI;}}return iJ(0,iP);}var iR=[0,[0,ap,bT(iH,aq)],0],iS=[0,[0,an,bT(iH,ao)],iR],iT=[0,[0,al,bT(iH,am)],iS],iU=[0,[0,aj,bT(iH,ak)],iT],iV=[0,[0,ah,bT(iH,ai)],iU],iW=[0,[0,af,bT(iH,ag)],iV],iX=[0,[0,ad,bT(iH,ae)],iW],iY=[0,[0,ab,bT(iH,ac)],iX],jb=[0,[0,$,bT(iH,aa)],iY];function i0(i2,i1,iZ){switch(iZ[0]){case 1:var i3=i0(i2,i1,iZ[2]);return [1,i0(i2,i1,iZ[1]),i3];case 2:var i4=i0(i2,i1+1|0,iZ[2]);return [2,iZ[1],i4];case 3:var i5=iZ[1];return i1<=i5?[3,i5+i2|0]:[3,i5];default:return iZ;}}function i7(i9,i8,i6){switch(i6[0]){case 1:var i_=i7(i9,i8,i6[2]);return [1,i7(i9,i8,i6[1]),i_];case 2:var i$=i7(i9+1|0,i8,i6[2]);return [2,i6[1],i$];case 3:var ja=i6[1];return ja===i9?i0(i9,0,i8):i9<ja?[3,ja-1|0]:i6;default:return i6;}}var jc=[0,_];function jq(je,jd){try {var jf=bT(je,jd);}catch(jg){if(jg[1]===jc)return jd;throw jg;}return jf;}function jw(jr,jh){{if(1===jh[0]){var ji=jh[1];if(0===ji[0])try {var jj=jb,jl=ji[1];for(;;){if(!jj)throw [0,c];var jk=jj[1],jn=jj[2],jm=jk[2];if(0!==caml_compare(jk[1],jl)){var jj=jn;continue;}var jo=jm;break;}}catch(jp){if(jp[1]!==c)throw jp;var jo=ji;}else var jo=ji;{if(2===jo[0]){var js=jq(jr,jo[2]);return i7(0,jq(jr,jh[2]),js);}throw [0,jc];}}throw [0,jc];}}function jz(jt){switch(jt[0]){case 1:var ju=jt[2],jv=jt[1];try {var jx=jw(iC,jt);}catch(jy){if(jy[1]===jc){try {var jA=[1,jz(jv),ju];}catch(jB){if(jB[1]===jc)return [1,jv,jz(ju)];throw jB;}return jA;}throw jy;}return jx;case 2:var jC=jz(jt[2]);return [2,jt[1],jC];default:throw [0,jc];}}function jG(jD){switch(jD[0]){case 1:var jE=jD[2],jF=jD[1];try {var jH=[1,jG(jF),jE];}catch(jI){if(jI[1]===jc){try {var jJ=[1,jF,jG(jE)];}catch(jK){if(jK[1]===jc)return jw(iC,jD);throw jK;}return jJ;}throw jI;}return jH;case 2:var jL=jG(jD[2]);return [2,jD[1],jL];default:throw [0,jc];}}var jM=[0,Z];function j2(j0,jZ,jY,jX){function jU(jO,jS,jP,jN,jQ){if(0===jN)return cz(bC(jP,jO));try {var jR=[0,jQ,jO],jT=bT(jS,jQ);if(cB(jT,jR))throw [0,jM,jT];var jV=jU(jR,jS,jP,jN-1|0,jT);}catch(jW){if(jW[1]===jc)return cz([0,jQ,jO]);if(jW[1]===jM)return cz([0,aV,[0,jW[2],[0,jQ,jO]]]);throw jW;}return jV;}return jU(0,j0,jZ,jY,jX);}function j4(j1){return cr(iD,dh(j2,jz,e,j1),iH);}function j5(j3){return cr(iD,dh(j2,jG,e,j3),iH);}function kw(kk){function j7(j8,j6){switch(j6[0]){case 1:var j9=j7(j8,j6[1]);return hF(0,[0,j9],[0,j7(j8,j6[2])]);case 2:var j_=j6[1],j$=j_,ka=[0,j_,j8],kb=j6[2];for(;;){if(2===kb[0]){var kc=kb[1],kd=kb[2],kf=[0,kc,ka],ke=bF(j$,kc),j$=ke,ka=kf,kb=kd;continue;}return hF([2,j$],[0,j7(ka,kb)],0);}case 3:try {var kg=cy(j8,j6[1]),kh=kg;}catch(ki){if(ki[1]===a&&!caml_string_notequal(ki[2],q)){var kh=p,kj=1;}else var kj=0;if(!kj)throw ki;}return hF([1,kh],0,0);default:return hF([0,j6[1]],0,0);}}return j7(0,kk);}function kp(kl){var km=kl;for(;;){var kn=km[3];if(kn){var ko=km[4];if(ko){var kq=kp(kn[1]),kr=kp(ko[1]),ks=caml_greaterequal(kr,kq)?kr:kq;return ks;}var kt=0;}else{var ku=km[4];if(ku){var kv=ku[1],kt=1;}else var kt=0;}if(!kt){if(!kn)return km[6];var kv=kn[1];}var km=kv;continue;}}var kx=fX.document;function kz(ky){throw [0,d,t];}var kA=fG(kx.getElementById(o.toString()),gH,kz);function kC(kB){throw [0,d,u];}var kE=fG(kx.getElementById(n.toString()),gE,kC);function kF(kD){throw [0,d,v];}var kG=fG(kx.getElementById(m.toString()),gG,kF),kH=kG.getContext(f7);function kJ(kI){throw [0,d,w];}var kK=fG(kx.getElementById(l.toString()),hE,kJ);function kM(kL){throw [0,d,x];}var kN=fG(kx.getElementById(k.toString()),gF,kM);function kP(kO){throw [0,d,y];}var kQ=fG(kx.getElementById(j.toString()),gF,kP),kR=[0,j4],kS=[0,0];function lp(kT,kU){return bT(kU,kT);}function lr(kY){kH.fillStyle=E.toString();kH.fillRect(0,0,500,500);kH.beginPath();var kV=[0,30],kW=[0,30],kX=30,kZ=kp(kY),k0=kY;for(;;){var k1=k0[4];if(k1){var k2=k1[1],k0=k2;continue;}var k3=k0[5];if(kG.width-kX<k3*kV[1])kV[1]=(kG.width-2*kX)/k3;if(kG.height-kX<kZ*kW[1])kW[1]=(kG.height-2*kX)/kZ;var lk=function(k$,k4,k6){var k5=k4,k7=k6;for(;;){var k8=k5[2],k9=kX+k7[6]*kW[1],k_=kX+k7[5]*kV[1];k$.moveTo(k_,k9);if(0<k8){k$.lineTo(k5[1],k8);k$.stroke();}var la=k9+15;k$.moveTo(k_,la);var lb=k7[1],lc=typeof lb==="number"?s:2===lb[0]?bF(r,lb[1]):lb[1],lg=la-2,lf=k_-(lc.getLen()*2|0),ld=k7[1];if(typeof ld==="number")var le=D;else switch(ld[0]){case 1:var le=B;break;case 2:var le=A;break;default:var le=C;}k$.fillStyle=le.toString();k$.fillText(lc.toString(),lf,lg);var lh=k7[3],li=k7[4];if(lh){var lj=lh[1];if(li){lk(k$,[0,k_,la+5],lj);var lm=li[1],ll=[0,k_,la+5],k5=ll,k7=lm;continue;}var ln=lj;}else{if(!li)return li;var ln=li[1];}var lo=[0,k_,la+5],k5=lo,k7=ln;continue;}};return lk(kH,z,kY);}}function lA(lq){return lp(lp(lp(lp(lq,iQ),kw),hG),lr);}function lB(ly){var ls=kN.childNodes,lt=0,lu=ls.length-1|0;if(!(lu<lt)){var lv=lt;for(;;){var lw=ls.item(lv);if(lw!=fA)kN.removeChild(lw);var lx=lv+1|0;if(lu!==lv){var lv=lx;continue;}break;}}return 0;}function ma(l$){kS[1]=cr(kR[1],-1,new MlWrappedString(kA.value));var lz=cx(kS[1])-1|0;lA(cy(kS[1],lz));lB(0);lB(0);var lC=gu([0,L.toString()],0,kx),lD=gu([0,K.toString()],0,kx);lC.value=J.toString();lD.value=I.toString();fV(kN,lC);fV(kN,lD);var lE=gq(0,0,kx,aY);lE.size=6;lE.style.minWidth=H.toString();lE.style.marginTop=G.toString();lE.style.display=F.toString();function lH(lG){var lF=f8(kx,aX);fV(lF,kx.createTextNode(lG.toString()));return fV(lE,lF);}fV(kN,lE);var l1=kS[1];cA(lH,cg(function(lI){var l0=iQ(lI);function lP(lK,lM,lQ,lJ){switch(lJ[0]){case 1:var lL=1-lK,lO=lJ[2],lN=lL?lM:lL,lR=bF(aT,lP(1,lN,lQ,lO)),lS=bF(lP(0,1,lQ,lJ[1]),lR);return lK?bF(aR,bF(lS,aS)):lS;case 2:var lU=bF(aQ,lT(lQ,lJ));return lM?bF(aO,bF(lU,aP)):lU;case 3:try {var lV=cy(lQ,lJ[1]);}catch(lW){if(lW[1]===a&&!caml_string_notequal(lW[2],aN))return h(aM);throw lW;}return lV;default:return lJ[1];}}function lT(lZ,lX){{if(2===lX[0]){var lY=lX[1];return bF(lY,lT([0,lY,lZ],lX[2]));}return bF(aL,lP(0,0,lZ,lX));}}return lP(0,0,0,l0);},l1));lE.onchange=fW(function(l2){lA(cy(kS[1],lE.selectedIndex));return fI;});lC.onclick=fW(function(l6){var l3=lE.selectedIndex;if(0<=l3)if(0===l3)lE.selectedIndex=0;else{var l4=lE.selectedIndex-1|0;lE.selectedIndex=l4;lA(cy(kS[1],l4));}else{var l5=cx(kS[1])-2|0;lE.selectedIndex=l5;lA(cy(kS[1],l5));}return fI;});lD.onclick=fW(function(l_){var l7=lE.selectedIndex;if(0<=l7&&!(l7===(cx(kS[1])-1|0))){var l9=lE.selectedIndex+1|0;lE.selectedIndex=l9;lA(cy(kS[1],l9));var l8=1;}else var l8=0;if(!l8)lE.selectedIndex=cx(kS[1])-1|0;return fI;});return fI;}kE.onclick=fW(ma);kK.onchange=fW(function(mc){var mb=new MlWrappedString(kK.value);if(caml_string_notequal(mb,O)){if(caml_string_notequal(mb,N))throw [0,d,M];kR[1]=j5;}else kR[1]=j4;return fI;});var mj=[0,[0,P,j4,0],[0,[0,Q,j4,0],[0,[0,R,j4,S],[0,[0,T,j4,U],[0,[0,V,j5,W],0]]]]];cA(function(md){var me=md[3],mf=md[1],mh=md[2],mg=f8(kx,a1);mg.href=Y.toString();mg.onclick=fW(function(mi){kA.value=mf.toString();kR[1]=mh;ma(0);return fI;});fV(mg,kx.createTextNode(mf.toString()));fV(kQ,mg);if(me)fV(kQ,kx.createTextNode(bF(X,me[1]).toString()));return fV(kQ,f8(kx,a0));},mj);kA.value=i.toString();bV(0);return;}());
