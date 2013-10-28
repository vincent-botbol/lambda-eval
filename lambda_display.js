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
(function(){function di(mq,mr,ms,mt){return mq.length==3?mq(mr,ms,mt):caml_call_gen(mq,[mr,ms,mt]);}function cs(mn,mo,mp){return mn.length==2?mn(mo,mp):caml_call_gen(mn,[mo,mp]);}function bU(ml,mm){return ml.length==1?ml(mm):caml_call_gen(ml,[mm]);}var a=[0,new MlString("Failure")],b=[0,new MlString("Invalid_argument")],c=[0,new MlString("Not_found")],d=[0,new MlString("Assert_failure")],e=[0,[0,new MlString("...")],0];caml_register_global(6,c);caml_register_global(5,[0,new MlString("Division_by_zero")]);caml_register_global(3,b);caml_register_global(2,a);var bv=new MlString("output"),bu=new MlString("Pervasives.do_at_exit"),bt=new MlString("nth"),bs=new MlString("List.nth"),br=new MlString("String.blit"),bq=new MlString("Buffer.add_substring"),bp=new MlString("Buffer.add: cannot grow buffer"),bo=[3,0,3],bn=new MlString("."),bm=new MlString(">"),bl=new MlString("</"),bk=new MlString(">"),bj=new MlString("<"),bi=new MlString("\n"),bh=new MlString("Format.Empty_queue"),bg=[0,new MlString("")],bf=new MlString("\""),be=new MlString(" name=\""),bd=new MlString("\""),bc=new MlString(" type=\""),bb=new MlString("<"),ba=new MlString(">"),a$=new MlString(""),a_=new MlString("<input name=\"x\">"),a9=new MlString("input"),a8=new MlString("x"),a7=new MlString("select"),a6=new MlString("input"),a5=new MlString("div"),a4=new MlString("canvas"),a3=new MlString("button"),a2=new MlString("a"),a1=new MlString("br"),a0=new MlString("input"),aZ=new MlString("select"),aY=new MlString("option"),aX=new MlString("2d"),aW=[0,new MlString("Infinite loop detected")],aV=new MlString("'"),aU=new MlString(" "),aT=new MlString(")"),aS=new MlString("("),aR=new MlString("\xce\xbb"),aQ=new MlString(")"),aP=new MlString("("),aO=new MlString("nth"),aN=new MlString("cannot retrieve"),aM=new MlString("."),aL=new MlString("parse"),aK=new MlString("("),aJ=new MlString(")"),aI=new MlString("."),aH=new MlString("l"),aG=new MlString("parse"),aF=new MlString(")"),aE=new MlString("parse"),aD=[0,0,0],aC=new MlString("."),aB=[0,new MlString("l"),[0,new MlString("("),[0,new MlString(")"),0]]],aA=new MlString("parse"),az=new MlString("parse"),ay=new MlString("parse"),ax=[0,new MlString(" "),[0,new MlString("\t"),[0,new MlString("\n"),0]]],aw=[0,new MlString("l"),[0,new MlString("."),[0,new MlString("("),[0,new MlString(")"),0]]]],av=new MlString("'"),au=new MlString("lex"),at=new MlString("'"),as=new MlString(""),ar=new MlString("labcd.ab(adc)"),aq=new MlString("J"),ap=new MlString("lxy.y"),ao=new MlString("F"),an=new MlString("lxy.x"),am=new MlString("T"),al=new MlString("lf.(lx.f(xx))(lx.f(xx))"),ak=new MlString("Y"),aj=new MlString("lxyz.xzy"),ai=new MlString("C"),ah=new MlString("lxyz.x(yz)"),ag=new MlString("B"),af=new MlString("lxyz.(xz)(yz)"),ae=new MlString("S"),ad=new MlString("lxy.x"),ac=new MlString("K"),ab=new MlString("lx.x"),aa=new MlString("I"),$=new MlString("Lambda.Normal"),_=new MlString("Lambda.Irreductible"),Z=new MlString("#"),Y=new MlString(" - "),X=[0,new MlString("Appel par valeur")],W=new MlString("(lxy.yx)((lx.x) 1) (lx.x)"),V=[0,new MlString("Appel par nom")],U=new MlString("(lxy.yx)((lx.x) 1) (lx.x)"),T=[0,new MlString("Terme irreductible")],S=new MlString("(lx.xx)(lx.xx)"),R=new MlString("(KISS)(KISS)"),Q=new MlString("(lx.f x) a"),P=new MlString("cbn"),O=new MlString("cbv"),N=[0,new MlString("lambda_display.ml"),217,13],M=new MlString("submit"),L=new MlString("submit"),K=new MlString("Prev"),J=new MlString("Next"),I=new MlString("250px"),H=new MlString("600px"),G=new MlString("10px"),F=new MlString("block"),E=new MlString("#FFFFFF"),D=new MlString("#FF0000"),C=new MlString("#0000FF"),B=new MlString("#006400"),A=new MlString("#FFA000"),z=[0,0,0],y=[0,new MlString("lambda_display.ml"),66,34],x=[0,new MlString("lambda_display.ml"),64,34],w=[0,new MlString("lambda_display.ml"),62,37],v=[0,new MlString("lambda_display.ml"),59,37],u=[0,new MlString("lambda_display.ml"),57,37],t=[0,new MlString("lambda_display.ml"),55,36],s=new MlString("app"),r=new MlString("\xce\xbb"),q=new MlString("nth"),p=new MlString("?"),o=new MlString("MonQ"),n=new MlString("MonB"),m=new MlString("MonC"),l=new MlString("MonS"),k=new MlString("MonP"),j=new MlString("examples"),i=new MlString("(KISS)(KISS)");function h(f){throw [0,a,f];}function bw(g){throw [0,b,g];}var bH=(1<<31)-1|0;function bG(bx,bz){var by=bx.getLen(),bA=bz.getLen(),bB=caml_create_string(by+bA|0);caml_blit_string(bx,0,bB,0,by);caml_blit_string(bz,0,bB,by,bA);return bB;}function bD(bC,bE){if(bC){var bF=bC[1];return [0,bF,bD(bC[2],bE)];}return bE;}var bR=caml_ml_open_descriptor_out(1),bQ=caml_ml_open_descriptor_out(2);function bS(bL){var bI=caml_ml_out_channels_list(0);for(;;){if(bI){var bJ=bI[2];try {}catch(bK){}var bI=bJ;continue;}return 0;}}var bT=[0,bS];function bX(bP,bO,bM,bN){if(0<=bM&&0<=bN&&!((bO.getLen()-bN|0)<bM))return caml_ml_output(bP,bO,bM,bN);return bw(bv);}function bW(bV){return bU(bT[1],0);}caml_register_named_value(bu,bW);function cy(bZ){var bY=0,b0=bZ;for(;;){if(b0){var b2=b0[2],b1=bY+1|0,bY=b1,b0=b2;continue;}return bY;}}function cz(b4,b3){if(0<=b3){var b5=b4,b6=b3;for(;;){if(b5){var b9=b5[2],b7=b5[1];if(0!==b6){var b_=b6-1|0,b5=b9,b6=b_;continue;}var b8=b7;}else var b8=h(bt);return b8;}}return bw(bs);}function cA(b$){var ca=b$,cb=0;for(;;){if(ca){var cc=ca[2],cd=[0,ca[1],cb],ca=cc,cb=cd;continue;}return cb;}}function ch(cf,ce){if(ce){var cg=ce[2],ci=bU(cf,ce[1]);return [0,ci,ch(cf,cg)];}return 0;}function cB(cl,cj){var ck=cj;for(;;){if(ck){var cm=ck[2];bU(cl,ck[1]);var ck=cm;continue;}return 0;}}function co(cq,cn,cp){if(cn){var cr=cn[1];return cs(cq,cr,co(cq,cn[2],cp));}return cp;}function cC(cv,ct){var cu=ct;for(;;){if(cu){var cw=cu[2],cx=0===caml_compare(cu[1],cv)?1:0;if(cx)return cx;var cu=cw;continue;}return 0;}}function cL(cD,cF){var cE=caml_create_string(cD);caml_fill_string(cE,0,cD,cF);return cE;}function cM(cI,cH,cK,cJ,cG){if(0<=cG&&0<=cH&&!((cI.getLen()-cG|0)<cH)&&0<=cJ&&!((cK.getLen()-cG|0)<cJ))return caml_blit_string(cI,cH,cK,cJ,cG);return bw(br);}var cN=caml_sys_get_config(0)[2],cO=caml_mul(cN/8|0,(1<<(cN-10|0))-1|0)-1|0,cZ=[0,0];function c6(cV,cU,cP,cS){var cQ=cP<0?1:0;if(cQ)var cR=cQ;else{var cT=cS<0?1:0,cR=cT?cT:(cU.getLen()-cS|0)<cP?1:0;}if(cR)bw(bq);var cW=cV[2]+cS|0;if(cV[3]<cW){var cX=[0,cV[3]];for(;;){if(cX[1]<(cV[2]+cS|0)){cX[1]=2*cX[1]|0;continue;}if(cO<cX[1])if((cV[2]+cS|0)<=cO)cX[1]=cO;else h(bp);var cY=caml_create_string(cX[1]);cM(cV[1],0,cY,0,cV[2]);cV[1]=cY;cV[3]=cX[1];break;}}cM(cU,cP,cV[1],cV[2],cS);cV[2]=cW;return 0;}function c5(c0,c2){var c1=[0,[0,c0,0]],c3=c2[1];if(c3){var c4=c3[1];c2[1]=c1;c4[2]=c1;return 0;}c2[1]=c1;c2[2]=c1;return 0;}var c7=[0,bh];function dd(c8){var c9=c8[2];if(c9){var c_=c9[1],c$=c_[2],da=c_[1];c8[2]=c$;if(0===c$)c8[1]=0;return da;}throw [0,c7];}function de(dc,db){dc[13]=dc[13]+db[3]|0;return c5(db,dc[27]);}var df=1000000010;function ed(dh,dg){return di(dh[17],dg,0,dg.getLen());}function dm(dj){return bU(dj[19],0);}function du(dk,dl){return bU(dk[20],dl);}function dv(dn,dq,dp){dm(dn);dn[11]=1;var dr=(dn[6]-dp|0)+dq|0,ds=dn[8],dt=caml_lessequal(ds,dr)?ds:dr;dn[10]=dt;dn[9]=dn[6]-dn[10]|0;return du(dn,dn[10]);}function d_(dx,dw){return dv(dx,0,dw);}function dP(dy,dz){dy[9]=dy[9]-dz|0;return du(dy,dz);}function ex(dA){try {for(;;){var dB=dA[27][2];if(!dB)throw [0,c7];var dC=dB[1][1],dD=dC[1],dE=dC[2],dF=dD<0?1:0,dH=dC[3],dG=dF?(dA[13]-dA[12]|0)<dA[9]?1:0:dF,dI=1-dG;if(dI){dd(dA[27]);var dJ=0<=dD?dD:df;if(typeof dE==="number")switch(dE){case 1:var ef=dA[2];if(ef)dA[2]=ef[2];break;case 2:var eg=dA[3];if(eg)dA[3]=eg[2];break;case 3:var eh=dA[2];if(eh)d_(dA,eh[1][2]);else dm(dA);break;case 4:if(dA[10]!==(dA[6]-dA[9]|0)){var ei=dd(dA[27]),ej=ei[1];dA[12]=dA[12]-ei[3]|0;dA[9]=dA[9]+ej|0;}break;case 5:var ek=dA[5];if(ek){var el=ek[2];ed(dA,bU(dA[24],ek[1]));dA[5]=el;}break;default:var em=dA[3];if(em){var en=em[1][1],er=function(eq,eo){if(eo){var ep=eo[1],es=eo[2];return caml_lessthan(eq,ep)?[0,eq,eo]:[0,ep,er(eq,es)];}return [0,eq,0];};en[1]=er(dA[6]-dA[9]|0,en[1]);}}else switch(dE[0]){case 1:var dK=dE[2],dL=dE[1],dM=dA[2];if(dM){var dN=dM[1],dO=dN[2];switch(dN[1]){case 1:dv(dA,dK,dO);break;case 2:dv(dA,dK,dO);break;case 3:if(dA[9]<dJ)dv(dA,dK,dO);else dP(dA,dL);break;case 4:if(dA[11])dP(dA,dL);else if(dA[9]<dJ)dv(dA,dK,dO);else if(((dA[6]-dO|0)+dK|0)<dA[10])dv(dA,dK,dO);else dP(dA,dL);break;case 5:dP(dA,dL);break;default:dP(dA,dL);}}break;case 2:var dQ=dA[6]-dA[9]|0,dR=dA[3],d3=dE[2],d2=dE[1];if(dR){var dS=dR[1][1],dT=dS[1];if(dT){var dZ=dT[1];try {var dU=dS[1];for(;;){if(!dU)throw [0,c];var dV=dU[1],dX=dU[2];if(!caml_greaterequal(dV,dQ)){var dU=dX;continue;}var dW=dV;break;}}catch(dY){if(dY[1]!==c)throw dY;var dW=dZ;}var d0=dW;}else var d0=dQ;var d1=d0-dQ|0;if(0<=d1)dP(dA,d1+d2|0);else dv(dA,d0+d3|0,dA[6]);}break;case 3:var d4=dE[2],d$=dE[1];if(dA[8]<(dA[6]-dA[9]|0)){var d5=dA[2];if(d5){var d6=d5[1],d7=d6[2],d8=d6[1],d9=dA[9]<d7?0===d8?0:5<=d8?1:(d_(dA,d7),1):0;d9;}else dm(dA);}var eb=dA[9]-d$|0,ea=1===d4?1:dA[9]<dJ?d4:5;dA[2]=[0,[0,ea,eb],dA[2]];break;case 4:dA[3]=[0,dE[1],dA[3]];break;case 5:var ec=dE[1];ed(dA,bU(dA[23],ec));dA[5]=[0,ec,dA[5]];break;default:var ee=dE[1];dA[9]=dA[9]-dJ|0;ed(dA,ee);dA[11]=0;}dA[12]=dH+dA[12]|0;continue;}break;}}catch(et){if(et[1]===c7)return 0;throw et;}return dI;}function ey(ew,ev,eu){return [0,ew,ev,eu];}var ez=[0,[0,-1,ey(-1,bg,0)],0];function eH(eA){eA[1]=ez;return 0;}function eO(eB,eJ){var eC=eB[1];if(eC){var eD=eC[1],eE=eD[2],eF=eE[1],eG=eC[2],eI=eE[2];if(eD[1]<eB[12])return eH(eB);if(typeof eI!=="number")switch(eI[0]){case 1:case 2:var eK=eJ?(eE[1]=eB[13]+eF|0,eB[1]=eG,0):eJ;return eK;case 3:var eL=1-eJ,eM=eL?(eE[1]=eB[13]+eF|0,eB[1]=eG,0):eL;return eM;default:}return 0;}return 0;}function eZ(eN,eW){var eP=0;for(;;){if(1<eN[14]){if(1<eN[14]){if(eN[14]<eN[15]){de(eN,[0,0,1,0]);eO(eN,1);eO(eN,0);}eN[14]=eN[14]-1|0;}continue;}eN[13]=df;ex(eN);if(eP)dm(eN);eN[12]=1;eN[13]=1;var eQ=eN[27];eQ[1]=0;eQ[2]=0;eH(eN);eN[2]=0;eN[3]=0;eN[4]=0;eN[5]=0;eN[10]=0;eN[14]=0;eN[9]=eN[6];eN[14]=eN[14]+1|0;var eR=3,eS=0;if(eN[14]<eN[15]){var eT=ey(-eN[13]|0,[3,eS,eR],0);de(eN,eT);if(0)eO(eN,1);eN[1]=[0,[0,eN[13],eT],eN[1]];}else if(eN[14]===eN[15]){var eU=eN[16],eV=eU.getLen();de(eN,ey(eV,[0,eU],eV));ex(eN);}return bU(eN[18],0);}}function e1(eX,eY){return di(eX[17],bi,0,1);}var e0=cL(80,32);function fk(e5,e2){var e3=e2;for(;;){var e4=0<e3?1:0;if(e4){if(80<e3){di(e5[17],e0,0,80);var e6=e3-80|0,e3=e6;continue;}return di(e5[17],e0,0,e3);}return e4;}}function fg(e7){return bG(bj,bG(e7,bk));}function ff(e8){return bG(bl,bG(e8,bm));}function fe(e9){return 0;}function fo(fi,fh){function fa(e_){return 0;}var fb=[0,0,0];function fd(e$){return 0;}var fc=ey(-1,bo,0);c5(fc,fb);var fj=[0,[0,[0,1,fc],ez],0,0,0,0,78,10,78-10|0,78,0,1,1,1,1,bH,bn,fi,fh,fd,fa,0,0,fg,ff,fe,fe,fb];fj[19]=bU(e1,fj);fj[20]=bU(fk,fj);return fj;}function fp(fl){function fn(fm){return caml_ml_flush(fl);}return fo(bU(bX,fl),fn);}var fq=512,fr=1<=fq?fq:1,fs=cO<fr?cO:fr,ft=caml_create_string(fs),fu=fp(bR);fp(bQ);var fw=[0,ft,0,fs,ft];function fx(fv){return 0;}fo(bU(c6,fw),fx);var fy=bU(eZ,fu),fz=bT[1];bT[1]=function(fA){bU(fy,0);return bU(fz,0);};var fB=null,fI=undefined;function fH(fC,fE,fF){var fD=fC==fB?fB:bU(fE,fC),fG=fD==fB?bU(fF,fC):fD;return fG;}var fJ=true,fK=Array;function fM(fL){return fL instanceof fK?0:[0,new MlWrappedString(fL.toString())];}cZ[1]=[0,fM,cZ[1]];function fO(fN){return fN;}function fW(fP,fQ){fP.appendChild(fQ);return 0;}function fX(fS){return fO(caml_js_wrap_callback(function(fR){if(fR){var fT=bU(fS,fR);if(!(fT|0))fR.preventDefault();return fT;}var fU=event,fV=bU(fS,fU);fU.returnValue=fV;return fV;}));}var fY=this,f8=aX.toString(),f7=fY.document;function f6(fZ,f0){return fZ?bU(f0,fZ[1]):0;}function f3(f2,f1){return f2.createElement(f1.toString());}function f9(f5,f4){return f3(f5,f4);}var f_=[0,785140586];function gr(f$,ga,gc,gb){for(;;){if(0===f$&&0===ga)return f3(gc,gb);var gd=f_[1];if(785140586===gd){try {var ge=f7.createElement(a_.toString()),gf=a9.toString(),gg=ge.tagName.toLowerCase()===gf?1:0,gh=gg?ge.name===a8.toString()?1:0:gg,gi=gh;}catch(gk){var gi=0;}var gj=gi?982028505:-1003883683;f_[1]=gj;continue;}if(982028505<=gd){var gl=new fK();gl.push(bb.toString(),gb.toString());f6(f$,function(gm){gl.push(bc.toString(),caml_js_html_escape(gm),bd.toString());return 0;});f6(ga,function(gn){gl.push(be.toString(),caml_js_html_escape(gn),bf.toString());return 0;});gl.push(ba.toString());return gc.createElement(gl.join(a$.toString()));}var go=f3(gc,gb);f6(f$,function(gp){return go.type=gp;});f6(ga,function(gq){return go.name=gq;});return go;}}function gv(gu,gt,gs){return gr(gu,gt,gs,a0);}this.HTMLElement===fI;function gz(gw,gx){var gy=gw.toString();return gx.tagName.toLowerCase()===gy?fO(gx):fB;}function gF(gA){return gz(a3,gA);}function gH(gB){return gz(a4,gB);}function gG(gC){return gz(a5,gC);}function gI(gD){return gz(a6,gD);}function hF(gE){return gz(a7,gE);}function hk(gJ){var gK=gJ[2];if(gK)return [0,gK[1]];var gL=gJ[3],gM=gJ[4];if(gM)return [0,gM[1]];var gN=gL?[0,gL[1]]:gL;return gN;}function hj(gO){var gP=gO[2];if(gP)return [0,gP[1]];var gQ=gO[3];if(gQ)return [0,gQ[1]];var gR=gO[4],gS=gR?[0,gR[1]]:gR;return gS;}function gW(gT,gU){gT[5]=gT[5]+gU|0;var gV=gT[3];if(gV)gW(gV[1],gU+gT[8]|0);var gX=gT[4];if(gX)gW(gX[1],gU+gT[8]|0);return gT;}function g3(gY,g2){var gZ=gY[3],g0=gY[4];if(gZ){var g1=gZ[1];if(g0){var g4=g3(g1,g2+1|0),g5=g3(g0[1],g2+1|0);gY[6]=g2;var g6=g4,g7=g5,g8=0,g9=0,g_=0,g$=0,ha=0;for(;;){var hb=g9?g9[1]:0,hc=g_?g_[1]:0,hd=(g6[5]+hb|0)-(g7[5]+hc|0)|0;if(g8){var he=g8[1],hf=he<hd?hd:he,hg=hf;}else var hg=hd;var hh=g$?g$[1]:g6,hi=ha?ha[1]:g7,hm=hj(hh),hl=hk(g6),hn=hj(g7),ht=hk(hi);if(hl&&hn){var hs=[0,hc+g7[7]|0],hr=[0,hb+g6[7]|0],hq=[0,hg],hp=hn[1],ho=hl[1],g6=ho,g7=hp,g8=hq,g9=hr,g_=hs,g$=hm,ha=ht;continue;}var hu=(hg+1|0)+(((g5[5]+g4[5]|0)+(hg+1|0)|0)%2|0)|0;g5[8]=hu;g5[5]=g5[5]+hu|0;var hw=g5[4];if(g5[3]||hw)var hv=0;else{var hx=hc,hv=1;}if(!hv)var hx=hc+hu|0;var hy=hl?hn?0:(hi[2]=[0,hl[1]],hi[8]=hb-hx|0,1):hn?(hh[2]=[0,hn[1]],hh[8]=hx-hb|0,1):0;hy;gY[5]=(g4[5]+g5[5]|0)/2|0;return gY;}}var hz=g1;}else{if(!g0){gY[5]=0;gY[6]=g2;return gY;}var hz=g0[1];}gY[5]=g3(hz,g2+1|0)[5];gY[6]=g2;return gY;}function hH(hA){return gW(g3(hA,0),0);}function hG(hB,hD,hE){var hC=[0,hB,0,0,0,0,0,0,0].slice();hC[3]=hD;hC[4]=hE;return hC;}function iD(hI){return hI;}function iE(hL,hK,hJ){return bU(hL,bU(hK,hJ));}function hO(hN,hM){if(hM)return caml_equal(hN,hM[1])?0:hO(hN,hM[2])+1|0;throw [0,c];}function iF(hP){function hR(hQ){try {var hS=cL(1,hP.safeGet(hQ)),hT=[0,hS,hR(hQ+1|0)];}catch(hU){if(hU[1]===b)return 0;throw hU;}return hT;}return hR(0);}function h6(hV){return co(bG,hV,as);}function iG(h9){function h0(hW){var hX=hW;for(;;){if(hX){var hY=hX[2],hZ=hX[1];if(cC(hZ,ax)){var hX=hY;continue;}if(cC(hZ,aw))return [0,hZ,h0(hY)];if(caml_string_equal(hZ,av))return h(au);var h1=[0,hZ,0],h2=hY;for(;;){if(h2){var h3=h2[1];if(caml_string_equal(h3,at)){var h4=h2[2],h5=bD(h1,[0,h3,0]),h1=h5,h2=h4;continue;}var h7=h0(h2),h8=[0,h6(h1),h7];}else var h8=[0,h6(h1),0];return h8;}}return hX;}}return h0(h9);}function iH(iB){function it(ia,h$){var ib=h_(ia,h$),ic=ib[1],ii=ib[2];for(;;){if(ic){var id=ic[2],ie=ic[1];if(id){var ig=[0,[1,ie,id[1]],id[2]],ic=ig;continue;}var ih=ie;}else var ih=h(aL);return [0,ih,ii];}}function h_(il,ij){if(ij){var ik=ij[1];if(caml_string_notequal(ik,aK)){if(caml_string_notequal(ik,aJ)){if(caml_string_notequal(ik,aI)){if(caml_string_notequal(ik,aH)){try {var im=[3,hO(ik,il)],io=im;}catch(ip){if(ip[1]!==c)throw ip;var io=[0,ik];}var iq=h_(il,ij[2]);return [0,[0,io,iq[1]],iq[2]];}var is=ir(il,ij[2]);return [0,[0,is[1],0],is[2]];}return h(aG);}return [0,0,ij];}var iu=it(il,ij[2]),iv=iu[2];if(iv&&!caml_string_notequal(iv[1],aF)){var iw=h_(il,iv[2]);return [0,[0,iu[1],iw[1]],iw[2]];}return h(aE);}return aD;}function ir(iz,ix){if(ix){var iy=ix[1];if(caml_string_notequal(iy,aC)){if(cC(iy,aB))return h(aA);var iA=ir([0,iy,iz],ix[2]);return [0,[2,iy,iA[1]],iA[2]];}return it(iz,ix[2]);}return h(az);}var iC=it(0,iB);return 0===iC[2]?iC[1]:h(ay);}var iI=cs(iE,iH,cs(iE,iG,iF));function iR(iQ){function iK(iL,iJ){switch(iJ[0]){case 1:var iM=iK(iL,iJ[2]);return [1,iK(iL,iJ[1]),iM];case 2:var iN=iJ[1],iP=iJ[2];for(;;){if(cC(iN,iL)){var iO=bG(iN,aV),iN=iO;continue;}return [2,iN,iK([0,iN,iL],iP)];}default:return iJ;}}return iK(0,iQ);}var iS=[0,[0,aq,bU(iI,ar)],0],iT=[0,[0,ao,bU(iI,ap)],iS],iU=[0,[0,am,bU(iI,an)],iT],iV=[0,[0,ak,bU(iI,al)],iU],iW=[0,[0,ai,bU(iI,aj)],iV],iX=[0,[0,ag,bU(iI,ah)],iW],iY=[0,[0,ae,bU(iI,af)],iX],iZ=[0,[0,ac,bU(iI,ad)],iY],jc=[0,[0,aa,bU(iI,ab)],iZ];function i1(i3,i2,i0){switch(i0[0]){case 1:var i4=i1(i3,i2,i0[2]);return [1,i1(i3,i2,i0[1]),i4];case 2:var i5=i1(i3,i2+1|0,i0[2]);return [2,i0[1],i5];case 3:var i6=i0[1];return i2<=i6?[3,i6+i3|0]:[3,i6];default:return i0;}}function i8(i_,i9,i7){switch(i7[0]){case 1:var i$=i8(i_,i9,i7[2]);return [1,i8(i_,i9,i7[1]),i$];case 2:var ja=i8(i_+1|0,i9,i7[2]);return [2,i7[1],ja];case 3:var jb=i7[1];return jb===i_?i1(i_,0,i9):i_<jb?[3,jb-1|0]:i7;default:return i7;}}var jd=[0,$];function jr(jf,je){try {var jg=bU(jf,je);}catch(jh){if(jh[1]===jd)return je;throw jh;}return jg;}function jx(js,ji){{if(1===ji[0]){var jj=ji[1];if(0===jj[0])try {var jk=jc,jm=jj[1];for(;;){if(!jk)throw [0,c];var jl=jk[1],jo=jk[2],jn=jl[2];if(0!==caml_compare(jl[1],jm)){var jk=jo;continue;}var jp=jn;break;}}catch(jq){if(jq[1]!==c)throw jq;var jp=jj;}else var jp=jj;{if(2===jp[0]){var jt=jr(js,jp[2]);return i8(0,jr(js,ji[2]),jt);}throw [0,jd];}}throw [0,jd];}}function jA(ju){switch(ju[0]){case 1:var jv=ju[2],jw=ju[1];try {var jy=jx(iD,ju);}catch(jz){if(jz[1]===jd){try {var jB=[1,jA(jw),jv];}catch(jC){if(jC[1]===jd)return [1,jw,jA(jv)];throw jC;}return jB;}throw jz;}return jy;case 2:var jD=jA(ju[2]);return [2,ju[1],jD];default:throw [0,jd];}}function jH(jE){switch(jE[0]){case 1:var jF=jE[2],jG=jE[1];try {var jI=[1,jH(jG),jF];}catch(jJ){if(jJ[1]===jd){try {var jK=[1,jG,jH(jF)];}catch(jL){if(jL[1]===jd)return jx(iD,jE);throw jL;}return jK;}throw jJ;}return jI;case 2:var jM=jH(jE[2]);return [2,jE[1],jM];default:throw [0,jd];}}var jN=[0,_];function j3(j1,j0,jZ,jY){function jV(jP,jT,jQ,jO,jR){if(0===jO)return cA(bD(jQ,jP));try {var jS=[0,jR,jP],jU=bU(jT,jR);if(cC(jU,jS))throw [0,jN,jU];var jW=jV(jS,jT,jQ,jO-1|0,jU);}catch(jX){if(jX[1]===jd)return cA([0,jR,jP]);if(jX[1]===jN)return cA([0,aW,[0,jX[2],[0,jR,jP]]]);throw jX;}return jW;}return jV(0,j1,j0,jZ,jY);}function j5(j2){return cs(iE,di(j3,jA,e,j2),iI);}function j6(j4){return cs(iE,di(j3,jH,e,j4),iI);}function kx(kl){function j8(j9,j7){switch(j7[0]){case 1:var j_=j8(j9,j7[1]);return hG(0,[0,j_],[0,j8(j9,j7[2])]);case 2:var j$=j7[1],ka=j$,kb=[0,j$,j9],kc=j7[2];for(;;){if(2===kc[0]){var kd=kc[1],ke=kc[2],kg=[0,kd,kb],kf=bG(ka,kd),ka=kf,kb=kg,kc=ke;continue;}return hG([2,ka],[0,j8(kb,kc)],0);}case 3:try {var kh=cz(j9,j7[1]),ki=kh;}catch(kj){if(kj[1]===a&&!caml_string_notequal(kj[2],q)){var ki=p,kk=1;}else var kk=0;if(!kk)throw kj;}return hG([1,ki],0,0);default:return hG([0,j7[1]],0,0);}}return j8(0,kl);}function kq(km){var kn=km;for(;;){var ko=kn[3];if(ko){var kp=kn[4];if(kp){var kr=kq(ko[1]),ks=kq(kp[1]),kt=caml_greaterequal(ks,kr)?ks:kr;return kt;}var ku=0;}else{var kv=kn[4];if(kv){var kw=kv[1],ku=1;}else var ku=0;}if(!ku){if(!ko)return kn[6];var kw=ko[1];}var kn=kw;continue;}}var ky=fY.document;function kA(kz){throw [0,d,t];}var kB=fH(ky.getElementById(o.toString()),gI,kA);function kD(kC){throw [0,d,u];}var kF=fH(ky.getElementById(n.toString()),gF,kD);function kG(kE){throw [0,d,v];}var kH=fH(ky.getElementById(m.toString()),gH,kG),kI=kH.getContext(f8);function kK(kJ){throw [0,d,w];}var kL=fH(ky.getElementById(l.toString()),hF,kK);function kN(kM){throw [0,d,x];}var kO=fH(ky.getElementById(k.toString()),gG,kN);function kQ(kP){throw [0,d,y];}var kR=fH(ky.getElementById(j.toString()),gG,kQ),kS=[0,j5],kT=[0,0];function lq(kU,kV){return bU(kV,kU);}function ls(kZ){kI.fillStyle=E.toString();kI.fillRect(0,0,500,500);kI.beginPath();var kW=[0,30],kX=[0,30],kY=30,k0=kq(kZ),k1=kZ;for(;;){var k2=k1[4];if(k2){var k3=k2[1],k1=k3;continue;}var k4=k1[5];if(kH.width-kY<k4*kW[1])kW[1]=(kH.width-2*kY)/k4;if(kH.height-kY<k0*kX[1])kX[1]=(kH.height-2*kY)/k0;var ll=function(la,k5,k7){var k6=k5,k8=k7;for(;;){var k9=k6[2],k_=kY+k8[6]*kX[1],k$=kY+k8[5]*kW[1];la.moveTo(k$,k_);if(0<k9){la.lineTo(k6[1],k9);la.stroke();}var lb=k_+15;la.moveTo(k$,lb);var lc=k8[1],ld=typeof lc==="number"?s:2===lc[0]?bG(r,lc[1]):lc[1],lh=lb-2,lg=k$-(ld.getLen()*2|0),le=k8[1];if(typeof le==="number")var lf=D;else switch(le[0]){case 1:var lf=B;break;case 2:var lf=A;break;default:var lf=C;}la.fillStyle=lf.toString();la.fillText(ld.toString(),lg,lh);var li=k8[3],lj=k8[4];if(li){var lk=li[1];if(lj){ll(la,[0,k$,lb+5],lk);var ln=lj[1],lm=[0,k$,lb+5],k6=lm,k8=ln;continue;}var lo=lk;}else{if(!lj)return lj;var lo=lj[1];}var lp=[0,k$,lb+5],k6=lp,k8=lo;continue;}};return ll(kI,z,kZ);}}function lB(lr){return lq(lq(lq(lq(lr,iR),kx),hH),ls);}function lC(lz){var lt=kO.childNodes,lu=0,lv=lt.length-1|0;if(!(lv<lu)){var lw=lu;for(;;){var lx=lt.item(lw);if(lx!=fB)kO.removeChild(lx);var ly=lw+1|0;if(lv!==lw){var lw=ly;continue;}break;}}return 0;}function mb(ma){kT[1]=cs(kS[1],30,new MlWrappedString(kB.value));var lA=cy(kT[1])-1|0;lB(cz(kT[1],lA));lC(0);lC(0);var lD=gv([0,M.toString()],0,ky),lE=gv([0,L.toString()],0,ky);lD.value=K.toString();lE.value=J.toString();fW(kO,lD);fW(kO,lE);var lF=gr(0,0,ky,aZ);lF.size=6;lF.style.minWidth=I.toString();lF.style.maxWidth=H.toString();lF.style.marginTop=G.toString();lF.style.display=F.toString();function lI(lH){var lG=f9(ky,aY);fW(lG,ky.createTextNode(lH.toString()));return fW(lF,lG);}fW(kO,lF);var l2=kT[1];cB(lI,ch(function(lJ){var l1=iR(lJ);function lQ(lL,lN,lR,lK){switch(lK[0]){case 1:var lM=1-lL,lP=lK[2],lO=lM?lN:lM,lS=bG(aU,lQ(1,lO,lR,lP)),lT=bG(lQ(0,1,lR,lK[1]),lS);return lL?bG(aS,bG(lT,aT)):lT;case 2:var lV=bG(aR,lU(lR,lK));return lN?bG(aP,bG(lV,aQ)):lV;case 3:try {var lW=cz(lR,lK[1]);}catch(lX){if(lX[1]===a&&!caml_string_notequal(lX[2],aO))return h(aN);throw lX;}return lW;default:return lK[1];}}function lU(l0,lY){{if(2===lY[0]){var lZ=lY[1];return bG(lZ,lU([0,lZ,l0],lY[2]));}return bG(aM,lQ(0,0,l0,lY));}}return lQ(0,0,0,l1);},l2));lF.onchange=fX(function(l3){lB(cz(kT[1],lF.selectedIndex));return fJ;});lD.onclick=fX(function(l7){var l4=lF.selectedIndex;if(0<=l4)if(0===l4)lF.selectedIndex=0;else{var l5=lF.selectedIndex-1|0;lF.selectedIndex=l5;lB(cz(kT[1],l5));}else{var l6=cy(kT[1])-2|0;lF.selectedIndex=l6;lB(cz(kT[1],l6));}return fJ;});lE.onclick=fX(function(l$){var l8=lF.selectedIndex;if(0<=l8&&!(l8===(cy(kT[1])-1|0))){var l_=lF.selectedIndex+1|0;lF.selectedIndex=l_;lB(cz(kT[1],l_));var l9=1;}else var l9=0;if(!l9)lF.selectedIndex=cy(kT[1])-1|0;return fJ;});return fJ;}kF.onclick=fX(mb);kL.onchange=fX(function(md){var mc=new MlWrappedString(kL.value);if(caml_string_notequal(mc,P)){if(caml_string_notequal(mc,O))throw [0,d,N];kS[1]=j6;}else kS[1]=j5;return fJ;});var mk=[0,[0,Q,j5,0],[0,[0,R,j5,0],[0,[0,S,j5,T],[0,[0,U,j5,V],[0,[0,W,j6,X],0]]]]];cB(function(me){var mf=me[3],mg=me[1],mi=me[2],mh=f9(ky,a2);mh.href=Z.toString();mh.onclick=fX(function(mj){kB.value=mg.toString();kS[1]=mi;mb(0);return fJ;});fW(mh,ky.createTextNode(mg.toString()));fW(kR,mh);if(mf)fW(kR,ky.createTextNode(bG(Y,mf[1]).toString()));return fW(kR,f9(ky,a1));},mk);kB.value=i.toString();bW(0);return;}());
