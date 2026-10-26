"""Rebuild the photo-textured gatefold GLB using Pillow and NumPy.

Photographs remain untouched in references/. All dimensions are provisional.
No generative artwork or lettering is substituted for the supplied photographs.
"""
from pathlib import Path
import io
import json
import math
import struct
import copy
import numpy as np
from PIL import Image, ImageOps, ImageEnhance, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parent
TEX = ROOT / 'textures'
TEX.mkdir(exist_ok=True)


def photo(name, rotate=0):
    im = ImageOps.exif_transpose(Image.open(ROOT / 'references' / name)).convert('RGB')
    if rotate:
        im = im.rotate(rotate, expand=True)
    return im


def rectify(im, corners, size):
    """Four normalized image corners, ordered TL/TR/BR/BL; rectify perspective."""
    src = [(x * im.width, y * im.height) for x, y in corners]
    dst = [(0, 0), (size[0], 0), size, (0, size[1])]
    rows, rhs = [], []
    for (x, y), (u, v) in zip(dst, src):
        rows.extend([[x,y,1,0,0,0,-u*x,-u*y], [0,0,0,x,y,1,-v*x,-v*y]])
        rhs.extend([u,v])
    coeffs = np.linalg.solve(np.asarray(rows), np.asarray(rhs))
    out = im.transform(size, Image.Transform.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC)
    return ImageEnhance.Brightness(out).enhance(1.12)


def save(im, name):
    if name.endswith('.jpg'):
        im = im.copy()
        limit=2048 if name.endswith(('-normal.jpg','-orm.jpg')) else 4096
        im.thumbnail((limit,limit), Image.Resampling.LANCZOS)
        im.save(TEX / name, quality=94, subsampling=0, optimize=True)
    else:
        im = im.copy()
        im.save(TEX / name, optimize=True)
    return name


# Corner locations measured in the supplied photographs, not invented artwork.
front = rectify(photo('20261025_132657.jpg'),
    [(0.058,0.213),(0.944,0.202),(0.969,0.822),(0.050,0.822)], (4096,3688))
back = rectify(photo('20261025_132707.jpg'),
    [(0.061,0.194),(0.936,0.181),(0.959,0.795),(0.050,0.792)], (3072,2764))
card = rectify(photo('20261025_132814.jpg'),
    [(0.074,0.174),(0.909,0.173),(0.936,0.823),(0.047,0.821)], (3982,4096))
card_back = rectify(photo('20261025_132820.jpg'),
    [(0.115,0.205),(0.905,0.190),(0.925,0.798),(0.119,0.800)], (3072,3160))
inside = photo('20261025_133000.jpg', 90)
inner = rectify(inside, [(558/1600,518/1200),(1096/1600,520/1200),
    (1109/1600,1023/1200),(543/1600,1017/1200)], (3072,2764))
left_inner = rectify(inside, [(280/1600,465/1200),(544/1600,520/1200),
    (530/1600,1017/1200),(242/1600,1070/1200)], (1536,2764))
right_inner = rectify(inside, [(1108/1600,523/1200),(1399/1600,486/1200),
    (1433/1600,1077/1200),(1118/1600,1022/1200)], (1536,2764))

def balance_landscape(im, black, white, gamma=1):
    """Remove panel-wide photographic glare without replacing printed detail.

    Each gate was photographed at a different angle to the light. Correct the
    broad luminance range before studio lighting, retaining the original hue.
    """
    rgb=np.asarray(im,dtype=np.float32)/255
    lum=rgb @ np.array([.2126,.7152,.0722],dtype=np.float32)
    corrected=np.clip((lum-black)/(white-black),0,1)**gamma
    # Soft toe keeps the darkest printed cypresses from clipping to black.
    corrected=.035+.90*corrected
    rgb=np.clip(rgb*(corrected/np.maximum(lum,.001))[:,:,None],0,1)
    return Image.fromarray((rgb*255).astype('uint8'))

left_inner=balance_landscape(left_inner,.22,.98,1.02)
right_inner=balance_landscape(right_inner,.025,.81,.93)
inner=balance_landscape(inner,.045,.94,.98)

# Extract the actual paper crest. White paper is separated from blue/green scenery,
# then interior holes are filled so gold lettering remains part of the texture.
crest_box = tuple(v*2 for v in (550,315,1460,1170))
crest = front.crop(crest_box).convert('RGBA')
rgb = np.asarray(crest)[:,:,:3].astype(float)
white = ((rgb[:,:,0] > 168) & (rgb[:,:,0] > rgb[:,:,1]) &
         (rgb[:,:,0] > rgb[:,:,2]) & (rgb[:,:,2] > 140) &
         ((rgb[:,:,0] - rgb[:,:,1]) < 40))
mask = Image.fromarray((white * 255).astype('uint8')).filter(ImageFilter.MaxFilter(7))
mask = mask.filter(ImageFilter.MinFilter(5))
# Fill enclosed gold marks, keeping the exterior transparent.
outside = ImageOps.invert(mask)
ImageDraw.floodfill(outside, (0,0), 100, thresh=0)
a = np.asarray(outside)
mask = Image.fromarray(np.where(a == 100, 0, 255).astype('uint8'))
segmented_mask = mask.copy()
# Trace the photographed paper edge explicitly. Colour segmentation alone mistakes
# pale scenery for paper and creates stray fragments around the ornate silhouette.
crest_edge=[(414,29),(440,34),(461,57),(472,87),(499,110),(532,120),(550,148),
 (601,160),(634,180),(668,214),(685,247),(713,246),(740,263),(750,293),
 (734,323),(723,351),(741,380),(750,416),(739,457),(724,482),
 (750,490),(788,492),(815,502),(825,516),(807,536),(778,552),(749,572),
 (730,605),(700,640),(659,663),(620,679),(584,695),(552,714),
 (525,730),(492,737),(470,765),(448,784),(421,796),(403,793),
 (378,772),(360,746),(331,742),(303,737),(272,723),(247,710),
 (214,699),(185,680),(157,653),(131,630),(107,605),(89,581),
 (68,566),(47,547),(27,523),(25,504),(40,487),(66,478),(91,484),
 (114,494),(110,464),(111,430),(116,402),(114,378),(107,356),
 (111,329),(116,309),(132,286),(151,273),(173,265),(178,240),
 (185,215),(208,198),(235,185),(269,178),(285,173),(299,148),
 (323,125),(347,108),(361,80),(379,61),(396,52),(401,36)]
mask=Image.new('L',crest.size)
ImageDraw.Draw(mask).polygon([(x*2+80,y*2+40) for x,y in crest_edge],fill=255)
mask=ImageChops.darker(mask,segmented_mask).filter(ImageFilter.MinFilter(5))
mask=mask.point(lambda p:255 if p>127 else 0)
ImageDraw.floodfill(mask,(mask.width//2,mask.height//2),128,thresh=0)
mask=Image.fromarray(np.where(np.asarray(mask)==128,255,0).astype('uint8')).filter(ImageFilter.GaussianBlur(.5))
crest.putalpha(mask)
save(crest.convert('RGB'), 'crest-albedo.jpg')
save(crest.convert('RGB'), 'crest-photo.jpg')
crest_reverse = Image.new('RGBA', crest.size, (230,224,212,0))
crest_reverse.putalpha(mask)
save(crest_reverse, 'crest-reverse.png')

# The partly-open photograph exposes the real artwork underneath the crest.
# Rectify the complete gate to avoid a seam around the crest-shaped region. The previous row-wise
# interpolation sampled the white crest itself and produced horizontal stripes.
exposed_right=rectify(photo('20261025_132904.jpg'),
    [(565/900,220/1200),(746/900,320/1200),
     (766/900,868/1200),(580/900,936/1200)],(2048,3688))
original_right=front.crop((2048,0,4096,3688))
repair=Image.new('L',front.size)
repair.paste(mask,crest_box[:2])
repair=repair.resize((1024,922),Image.Resampling.LANCZOS)
repair=repair.filter(ImageFilter.MaxFilter(17)).filter(ImageFilter.GaussianBlur(4))
repair=repair.resize(front.size,Image.Resampling.BICUBIC)
repair=repair.crop((2048,0,4096,3688))
source=np.asarray(exposed_right,dtype=np.float32)
target=np.asarray(original_right,dtype=np.float32)
# Match the second photograph's broad colour/exposure using unobstructed print.
sample=(np.asarray(repair)<1)
sample[:200]=False;sample[-200:]=False
for c in range(3):
    s=source[:,:,c][sample];t=target[:,:,c][sample]
    slo,shi=np.percentile(s,[15,85]);tlo,thi=np.percentile(t,[15,85])
    source[:,:,c]=(source[:,:,c]-slo)*(thi-tlo)/max(shi-slo,1)+tlo
exposed_right=Image.fromarray(np.clip(source,0,255).astype('uint8'))
clean_right=exposed_right
save(front.crop((0,0,2048,3688)), 'cover-left.jpg')
save(clean_right, 'cover-right.jpg')
save(back, 'back.jpg')
save(inner, 'interior.jpg')
save(left_inner, 'inside-left.jpg')
save(right_inner, 'inside-right.jpg')
save(card, 'insert-front.jpg')
save(card_back, 'insert-back.jpg')
save(front.resize((1024,922)), 'poster.jpg')

# Trace the photographed cypress/valley die-cut edge. The bottom edge is a pocket.
edge = [(0,.36),(.055,.37),(.08,.35),(.105,.15),(.13,.085),(.145,.11),
    (.165,.235),(.183,.175),(.20,.235),(.225,.455),(.26,.46),(.285,.32),
    (.31,.27),(.325,.33),(.342,.48),(.375,.49),(.397,.405),(.415,.465),
    (.43,.53),(.50,.55),(.59,.56),(.68,.55),(.77,.53),(.84,.50),
    (.885,.46),(.91,.30),(.93,.285),(.95,.36),(.97,.46),(1,.47),
    (1,1),(0,1)]
pocket = inner.convert('RGBA')
pmask = Image.new('L', pocket.size)
ImageDraw.Draw(pmask).polygon([(int(x*pocket.width),int(y*pocket.height)) for x,y in edge], fill=255)
pocket.putalpha(pmask.filter(ImageFilter.GaussianBlur(.45)))
save(pocket.convert('RGB'),'pocket-albedo.jpg')


def paper_maps(im, prefix, foil=False, emboss=False, width=.157):
    """Separate photographed print from paper lighting; derive approximate PBR maps."""
    rgb=np.asarray(im.convert('RGB'),dtype=np.float32)/255
    light=im.convert('RGB').resize((256,256)).filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.GaussianBlur(6))
    field=np.asarray(light.resize(im.size,Image.Resampling.BICUBIC),dtype=np.float32)/255
    albedo=np.clip(rgb/np.maximum(field,.25)*np.array([.89,.87,.82]),0,1)
    save(Image.fromarray((albedo*255).astype('uint8')),prefix+'-albedo.jpg')
    r,gg,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
    gold=((r-gg>.022)&(gg-b>.035)&(r>.3)).astype(np.float32) if foil else np.zeros(r.shape,dtype=np.float32)
    if prefix=='insert':
        gold[int(.75*im.height):int(.88*im.height),int(.35*im.width):int(.65*im.width)]=0
    gold=np.asarray(Image.fromarray((gold*255).astype('uint8')).filter(ImageFilter.GaussianBlur(.6)),dtype=np.float32)/255
    if foil:
        # Remove the photograph's baked gold reflection; the studio lights supply it.
        metal_color=np.array([.72,.47,.16])
        albedo=albedo*(1-gold[:,:,None])+metal_color*gold[:,:,None]
        save(Image.fromarray((np.clip(albedo,0,1)*255).astype('uint8')),prefix+'-albedo.jpg')
    orm=np.ones((*gold.shape,3),dtype=np.float32)
    orm[:,:,1]=.89-.49*gold
    orm[:,:,2]=.94*gold
    save(Image.fromarray((orm*255).astype('uint8')),prefix+'-orm.jpg')
    if foil:
        foil_mask=Image.fromarray((gold*255).astype('uint8'))
        foil_mask.thumbnail((2048,2048),Image.Resampling.LANCZOS)
        save(foil_mask,prefix+'-foil-mask.png')
    lum=.2126*r+.7152*gg+.0722*b
    low=np.asarray(Image.fromarray((lum*255).astype('uint8')).filter(ImageFilter.GaussianBlur(3)),dtype=np.float32)/255
    grain=np.clip(lum-low,-.045,.045)
    # Small paper fibres and shallow stamped foil, in approximate metres.
    height=grain*.00022-gold*.000009
    if emboss:
        broad=np.asarray(Image.fromarray((lum*255).astype('uint8')).filter(ImageFilter.GaussianBlur(28)),dtype=np.float32)/255
        relief=np.clip(lum-broad,-.08,.08)
        height+=relief*.00048
    dy,dx=np.gradient(height,width/im.width)
    normal=np.stack([-dx,-dy,np.ones_like(dx)],axis=-1)
    normal/=np.linalg.norm(normal,axis=-1,keepdims=True)
    save(Image.fromarray(((normal*.5+.5)*255).astype('uint8')),prefix+'-normal.jpg')


paper_maps(card,'insert',foil=True)
paper_maps(card_back,'insert-back',emboss=True)
paper_maps(crest.convert('RGB'),'crest',foil=True,width=(crest.width/4096*.20))


def simplify(points,tolerance):
    if len(points)<3: return points
    a,b=np.asarray(points[0],float),np.asarray(points[-1],float)
    pp=np.asarray(points,float)
    if np.linalg.norm(b-a)<1e-10:
        dist=np.linalg.norm(pp-a,axis=1)
    else:
        v=b-a
        dist=np.abs(v[0]*(pp[:,1]-a[1])-v[1]*(pp[:,0]-a[0]))/np.linalg.norm(v)
    i=int(dist.argmax())
    if dist[i]>tolerance:
        return simplify(points[:i+1],tolerance)[:-1]+simplify(points[i:],tolerance)
    return [points[0],points[-1]]


def silhouette(alpha):
    """Trace the real cut edge using a Moore-neighbour contour, then simplify."""
    small=alpha.copy();small.thumbnail((1000,1000),Image.Resampling.LANCZOS)
    a=np.pad(np.asarray(small)>127,1)
    ys,xs=np.where(a)
    y=int(ys.min());x=int(np.where(a[y])[0][0])
    start=(x,y);p=start;back=(x-1,y);points=[]
    dirs=[(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1),(0,-1),(1,-1)]
    for _ in range(20000):
        points.append(p)
        rel=(back[0]-p[0],back[1]-p[1]);idx=dirs.index(rel)
        for k in range(1,9):
            ni=(idx+k)%8;dx,dy=dirs[ni];q=(p[0]+dx,p[1]+dy)
            if a[q[1],q[0]]:
                pdx,pdy=dirs[(ni-1)%8];back=(p[0]+pdx,p[1]+pdy);p=q;break
        else: break
        if p==start: break
    # Split a closed ring at its opposite point before RDP.
    mid=len(points)//2
    pts=simplify(points[:mid+1],1.2)[:-1]+simplify(points[mid:]+[points[0]],1.2)[:-1]
    return [[(x-1)/small.width,(y-1)/small.height] for x,y in pts]


def triangulate(poly):
    """Ear clipping for a simple non-convex paper outline (counter-clockwise)."""
    pts=np.asarray(poly,float)
    if np.sum(pts[:,0]*np.roll(pts[:,1],-1)-np.roll(pts[:,0],-1)*pts[:,1])<0:
        raise ValueError('Expected a counter-clockwise outline')
    remaining=list(range(len(poly)));tri=[]
    def cross(a,b): return a[0]*b[1]-a[1]*b[0]
    while len(remaining)>3:
        for j,ib in enumerate(remaining):
            ia,ic=remaining[j-1],remaining[(j+1)%len(remaining)]
            aa,bb,cc=pts[ia],pts[ib],pts[ic]
            if cross(bb-aa,cc-bb)<=1e-14: continue
            other=[i for i in remaining if i not in (ia,ib,ic)]
            pp=pts[other]
            ca=(bb-aa)[0]*(pp[:,1]-aa[1])-(bb-aa)[1]*(pp[:,0]-aa[0])
            cb=(cc-bb)[0]*(pp[:,1]-bb[1])-(cc-bb)[1]*(pp[:,0]-bb[0])
            cd=(aa-cc)[0]*(pp[:,1]-cc[1])-(aa-cc)[1]*(pp[:,0]-cc[0])
            if np.any((ca>=-1e-14)&(cb>=-1e-14)&(cd>=-1e-14)): continue
            tri.extend([ia,ib,ic]);remaining.pop(j);break
        else: raise ValueError('Could not triangulate paper outline')
    tri.extend(remaining)
    return tri


crest_outline=silhouette(mask)
pocket_outline=silhouette(pmask)


class GLB:
    def __init__(self):
        self.bin = bytearray()
        self.doc = dict(asset={'version':'2.0','generator':'Miidear photo-reference reconstruction'},
            scene=0,scenes=[{'nodes':[0]}],nodes=[{'name':'Guang & House — gatefold invitation','children':[]}],
            meshes=[],materials=[],images=[],textures=[],samplers=[{'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071}],
            bufferViews=[],accessors=[],animations=[])

    def blob(self, data, target=None):
        while len(self.bin)%4: self.bin.append(0)
        view={'buffer':0,'byteOffset':len(self.bin),'byteLength':len(data)}
        if target: view['target']=target
        self.bin.extend(data)
        self.doc['bufferViews'].append(view)
        return len(self.doc['bufferViews'])-1

    def accessor(self, data, typ, indices=False):
        arr=np.asarray(data,dtype='<u2' if indices else '<f4')
        a={'bufferView':self.blob(arr.tobytes(),34963 if indices else 34962),
           'componentType':5123 if indices else 5126,'count':len(arr),'type':typ}
        if not indices:
            a['min']=np.atleast_1d(arr.min(axis=0)).tolist()
            a['max']=np.atleast_1d(arr.max(axis=0)).tolist()
        self.doc['accessors'].append(a)
        return len(self.doc['accessors'])-1

    def material(self, name, image=None, alpha=False, color=None, normal=None, orm=None):
        pbr={'metallicFactor':0,'roughnessFactor':.92}
        mat={'name':name,'pbrMetallicRoughness':pbr,'doubleSided':False}
        def texture(image):
            self.doc['images'].append({'bufferView':self.blob((TEX/image).read_bytes()),
                'mimeType':'image/png' if image.endswith('.png') else 'image/jpeg','name':image})
            self.doc['textures'].append({'sampler':0,'source':len(self.doc['images'])-1})
            return {'index':len(self.doc['textures'])-1}
        if image:
            pbr['baseColorTexture']=texture(image)
            # These surfaces already contain photographic lighting. Relighting
            # them double-lights the print and changes the real foil's colour.
            mat['extensions']={'KHR_materials_unlit':{}}
            self.doc['extensionsUsed']=['KHR_materials_unlit']
        if normal: mat['normalTexture']={**texture(normal),'scale':.8}
        if orm:
            pbr['metallicFactor']=1
            pbr['roughnessFactor']=1
            pbr['metallicRoughnessTexture']=texture(orm)
        if color: pbr['baseColorFactor']=color
        if alpha: mat.update(alphaMode='MASK',alphaCutoff=.45)
        self.doc['materials'].append(mat)
        return len(self.doc['materials'])-1

    def primitive(self, positions, normals, uv, triangles, material, bow=None):
        primitive={'attributes':{'POSITION':self.accessor(positions,'VEC3'),
                'NORMAL':self.accessor(normals,'VEC3'),'TEXCOORD_0':self.accessor(uv,'VEC2')},
                'indices':self.accessor(triangles,'SCALAR',True),'material':material}
        if 'normalTexture' in self.doc['materials'][material]:
            primitive['attributes']['TANGENT']=self.accessor([[1 if n[2]>=0 else -1,0,0,-1] for n in normals],'VEC4')
        if 'baseColorTexture' not in self.doc['materials'][material]['pbrMetallicRoughness']:
            primitive['attributes'].pop('TEXCOORD_0',None)
        if bow:
            w,h=bow
            delta=[];ndelta=[]
            for (x,y,z),normal in zip(positions,normals):
                t=max(0,min(1,y/h+.5));spread=max(0,1-4*x*x/(w*w))
                dz=.011*spread*t
                delta.append([0,0,dz])
                if abs(normal[2])>.9:
                    new=np.array([.088*x/(w*w)*t,-.011*spread/h,1])
                    new=new/np.linalg.norm(new)*normal[2]
                    ndelta.append((new-np.asarray(normal)).tolist())
                else: ndelta.append([0,0,0])
            primitive['targets']=[{'POSITION':self.accessor(delta,'VEC3'),'NORMAL':self.accessor(ndelta,'VEC3')}]
        return primitive

    def plate(self, name, w, h, depth, front_mat, back_mat, edge_mat, radius=0, outline=None, bow=False):
        if outline:
            poly=[[(u-.5)*w,(.5-v)*h] for u,v in outline]
        elif radius:
            poly=[]
            for cx,cy,start in [(w/2-radius,h/2-radius,0),(-w/2+radius,h/2-radius,90),
                    (-w/2+radius,-h/2+radius,180),(w/2-radius,-h/2+radius,270)]:
                for a in np.linspace(start,start+90,17):
                    r=math.radians(a)
                    poly.append([cx+radius*math.cos(r),cy+radius*math.sin(r)])
        else: poly=[[w/2,h/2],[-w/2,h/2],[-w/2,-h/2],[w/2,-h/2]]
        pp=np.asarray(poly)
        if np.sum(pp[:,0]*np.roll(pp[:,1],-1)-np.roll(pp[:,0],-1)*pp[:,1])<0: poly=poly[::-1]
        primitives=[]
        n=len(poly)
        bevel=min(.00014,depth*.22)
        # A tiny physical bevel catches light along the cut paper edge.
        inner=[]
        for x,y in poly:
            inward=np.array([-x,-y]);inward/=max(np.linalg.norm(inward),1e-12)
            inner.append([x+inward[0]*bevel,y+inward[1]*bevel])
        tris=triangulate(inner)
        for side,mat in [(1,front_mat),(-1,back_mat)]:
            pos=[[x,y,side*depth/2] for x,y in inner]
            tri=tris if side==1 else [v for i in range(0,len(tris),3) for v in tris[i:i+3][::-1]]
            if bow:
                triangles=[[np.asarray(pos[i]) for i in tri[j:j+3]] for j in range(0,len(tri),3)]
                for _ in range(2):
                    refined=[]
                    for a,b,c in triangles:
                        ab,bc,ca=(a+b)/2,(b+c)/2,(c+a)/2
                        refined.extend([[a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]])
                    triangles=refined
                pos=[p.tolist() for triangle in triangles for p in triangle]
                tri=list(range(len(pos)))
            uv=[[x/w+.5 if side==1 else .5-x/w,.5-y/h] for x,y,z in pos]
            primitives.append(self.primitive(pos,[[0,0,side]]*len(pos),uv,tri,mat,(w,h) if bow else None))
        if depth:
            pos=[]; normals=[]; uv=[]; tri=[]
            rings=[(inner,depth/2),(poly,depth/2-bevel),(poly,-depth/2+bevel),(inner,-depth/2)]
            for band in range(3):
                ra,za=rings[band];rb,zb=rings[band+1]
                for i in range(n):
                    nxt=(i+1)%n
                    p,q=np.array(poly[i]),np.array(poly[nxt]);diff=q-p
                    normal=np.array([diff[1],-diff[0],np.linalg.norm(diff)*(1 if band==0 else -1 if band==2 else 0)])
                    normal/=np.linalg.norm(normal)
                    k=len(pos)
                    pos.extend([[*ra[i],za],[*rb[i],zb],[*rb[nxt],zb],[*ra[nxt],za]])
                    normals.extend([normal.tolist()]*4);uv.extend([[0,0],[0,1],[1,1],[1,0]])
                    tri.extend([k,k+1,k+2,k,k+2,k+3])
            primitives.append(self.primitive(pos,normals,uv,tri,edge_mat,(w,h) if bow else None))
        mesh={'name':name,'primitives':primitives}
        if bow: mesh['weights']=[0]
        self.doc['meshes'].append(mesh)
        return len(self.doc['meshes'])-1

    def node(self,name,parent=0,mesh=None,pos=None):
        node={'name':name}
        if mesh is not None: node['mesh']=mesh
        if pos is not None: node['translation']=pos
        self.doc['nodes'].append(node); idx=len(self.doc['nodes'])-1
        self.doc['nodes'][parent].setdefault('children',[]).append(idx)
        return idx

    def write(self,path):
        self.doc['buffers']=[{'byteLength':len(self.bin)}]
        text=json.dumps(self.doc,separators=(',',':'),ensure_ascii=False).encode('utf-8')
        text+=b' '*((-len(text))%4)
        binary=bytes(self.bin);binary+=b'\0'*((-len(binary))%4)
        total=12+8+len(text)+8+len(binary)
        path.write_bytes(struct.pack('<4sII',b'glTF',2,total)+struct.pack('<I4s',len(text),b'JSON')+text+
            struct.pack('<I4s',len(binary),b'BIN\0')+binary)


g=GLB()
paper=g.material('Warm ivory bevelled paper edges',color=[.88,.85,.78,1])
fl=g.material('Original left cover','cover-left.jpg')
fr=g.material('Original right cover','cover-right.jpg')
il=g.material('Left interior landscape','inside-left.jpg')
ir=g.material('Right interior landscape','inside-right.jpg')
bg=g.material('Interior landscape','interior.jpg')
bk=g.material('Exterior back','back.jpg')
cf=g.material('Photographed cotton paper and original foil','insert-front.jpg')
cb=g.material('Photographed embossed cotton reverse','insert-back.jpg')
cm=g.material('Original photographed monogram crest','crest-photo.jpg')
pk=g.material('Printed landscape pocket','pocket-albedo.jpg')
g.node('back-board',mesh=g.plate('Bevelled back board',.20,.18,.0014,bg,bk,paper,.0006))
left=g.node('left-hinge',pos=[-.10,0,.0050])
right=g.node('right-hinge',pos=[.10,0,.0054])
g.node('left-cover',left,g.plate('Bevelled left gate',.0998,.18,.0012,fl,il,paper,.0004),[.05,0,0])
g.node('right-cover',right,g.plate('Bevelled right gate',.0998,.18,.0012,fr,ir,paper,.0004),[-.05,0,0])
# Crest stays attached to the left gate, including the overhang across the seam.
cx=(crest_box[0]+crest_box[2])/2/4096*.20-.10
cy=.09-(crest_box[1]+crest_box[3])/2/3688*.18
g.node('crest',left,g.plate('Traced and bevelled paper crest',crest.width/4096*.20,crest.height/3688*.18,
    .00065,cm,paper,paper,outline=crest_outline),
    [cx+.10,cy,.0012])
insert=g.node('printed-insert',mesh=g.plate('Bevelled cotton invitation insert',.157,.161,.0009,cf,cb,paper,.012),
    pos=[0,.002,.002])
pocket_node=g.node('landscape-pocket',mesh=g.plate('Shaped, bowed die-cut landscape',.198,.178,.0005,
    pk,paper,paper,outline=pocket_outline,bow=True),pos=[0,-.0005,.0033])
fold=g.material('Linen hinge crease',color=[.67,.68,.59,1])
for x in [-.0997,.0997]:
    g.node('hinge-lining',mesh=g.plate('Fabric fold lining',.0012,.179,.0008,fold,fold,paper,.0002),pos=[x,0,.0013])

# A portable glTF animation: covers open first, then the loose insert is lifted out.
# 61 samples avoid quaternion interpolation taking an unintended shortcut at 180°.
times=np.linspace(0,5,61)
def smooth(a,b,t):
    u=max(0,min(1,(t-a)/(b-a))); return u*u*(3-2*u)
anim={'name':'Open invitation and reveal insert','samplers':[],'channels':[]}
def channel(node,path,values,kind):
    sampler={'input':g.accessor(times.tolist(),'SCALAR'),'output':g.accessor(values,kind),'interpolation':'LINEAR'}
    # Animation buffers are not vertex buffers.
    for acc in [sampler['input'],sampler['output']]:
        g.doc['bufferViews'][g.doc['accessors'][acc]['bufferView']].pop('target',None)
    anim['samplers'].append(sampler)
    anim['channels'].append({'sampler':len(anim['samplers'])-1,'target':{'node':node,'path':path}})
for node,sign,start in [(left,-1,.1),(right,1,.32)]:
    vals=[]
    for t in times:
        angle=sign*math.radians(172)*smooth(start,3.1,t)
        vals.append([0,math.sin(angle/2),0,math.cos(angle/2)])
    channel(node,'rotation',vals,'VEC4')
# Keep the card parallel and behind the pocket during extraction. Only bring
# it forward/tilt after its bottom has cleared the tallest die-cut cypress.
channel(insert,'translation',[[0,.002+.180*smooth(3.1,4.7,t),.002+.016*smooth(4.7,5,t)] for t in times],'VEC3')
channel(insert,'rotation',[[math.sin(-.045*smooth(4.7,5,t)),0,0,math.cos(-.045*smooth(4.7,5,t))] for t in times],'VEC4')
channel(pocket_node,'weights',[smooth(.8,2.8,t) for t in times],'SCALAR')
g.doc['animations']=[anim]
g.doc['extras']={'referenceFolder':'1MYeYyjLL1pme1-x_Nx199iLXQESKZ6Zr',
    'scale':'Nominal closed width 0.20m; estimated, not measured.',
    'limitations':['Artwork beneath the crest is registered from a second photograph; alignment and lighting are approximate.',
      'Foil and embossing maps are estimated from photographs, not measured material scans.',
      'Paper bowing and hidden support folds are approximated.'],
    'detail':'4K print textures, foil roughness/metallic masks, paper and emboss normal maps, traced cut edges, physical bevels, bowed pocket morph.'}
g.write(ROOT/'invitation.glb')
# A mobile edition retains the identical geometry and rig with smaller textures.
mobile=GLB();mobile.doc=copy.deepcopy(g.doc);mobile.bin=bytearray();mobile.doc['bufferViews']=[]
image_views={image['bufferView']:image['name'] for image in g.doc['images']}
for i,view in enumerate(g.doc['bufferViews']):
    blob=bytes(g.bin[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']])
    if i in image_views:
        image=Image.open(io.BytesIO(blob)).convert('RGB')
        limit=1024 if image_views[i].endswith(('-normal.jpg','-orm.jpg')) else 1536
        image.thumbnail((limit,limit),Image.Resampling.LANCZOS)
        out=io.BytesIO();image.save(out,format='JPEG',quality=90,subsampling=0,optimize=True);blob=out.getvalue()
    mobile.blob(blob,view.get('target'))
mobile.write(ROOT/'invitation-mobile.glb')
print(json.dumps({'file':'invitation.glb','bytes':(ROOT/'invitation.glb').stat().st_size,
    'meshes':len(g.doc['meshes']),'animation':anim['name'],'duration':5},indent=2))
