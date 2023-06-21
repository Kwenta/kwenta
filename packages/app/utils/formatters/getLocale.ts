import {
	af,
	arDZ,
	arMA,
	arSA,
	az,
	be,
	bg,
	bn,
	ca,
	cs,
	cy,
	da,
	de,
	deAT,
	el,
	enAU,
	enCA,
	enGB,
	enIN,
	enNZ,
	enUS,
	enZA,
	eo,
	es,
	et,
	eu,
	faIR,
	fi,
	fr,
	frCA,
	frCH,
	gd,
	gl,
	gu,
	he,
	hi,
	hr,
	ht,
	hu,
	hy,
	id,
	is,
	it,
	ja,
	ka,
	kk,
	kn,
	ko,
	lb,
	lt,
	lv,
	mk,
	mn,
	ms,
	mt,
	nb,
	nl,
	nlBE,
	nn,
	pl,
	pt,
	ptBR,
	ro,
	ru,
	sk,
	sl,
	sq,
	sr,
	srLatn,
	sv,
	ta,
	te,
	th,
	tr,
	ug,
	uk,
	uz,
	vi,
	zhCN,
	zhTW,
} from 'date-fns/locale'

function getLocale() {
	let locale_: Locale = enUS,
		language: Locale = { code: '' }

	navigator.languages !== undefined
		? (language.code = navigator.languages[0])
		: (language.code = navigator.language)

	switch (language.code) {
		case 'af':
			locale_ = af
			break
		case 'ar-dZ':
			locale_ = arDZ
			break
		case 'ar-ma':
			locale_ = arMA
			break
		case 'ar-sa':
			locale_ = arSA
			break
		case 'az':
			locale_ = az
			break
		case 'be':
			locale_ = be
			break
		case 'bg':
			locale_ = bg
			break
		case 'bn':
			locale_ = bn
			break
		case 'ca':
			locale_ = ca
			break
		case 'cs':
			locale_ = cs
			break
		case 'cy':
			locale_ = cy
			break
		case 'da':
			locale_ = da
			break
		case 'de':
			locale_ = de
			break
		case 'de-at':
			locale_ = deAT
			break
		case 'el':
			locale_ = el
			break
		case 'en-au':
			locale_ = enAU
			break
		case 'en-ca':
			locale_ = enCA
			break
		case 'en-gb':
			locale_ = enGB
			break
		case 'en-in':
			locale_ = enIN
			break
		case 'en-nz':
			locale_ = enNZ
			break
		case 'en-us':
			locale_ = enUS
			break
		case 'en-za':
			locale_ = enZA
			break
		case 'eo':
			locale_ = eo
			break
		case 'es':
			locale_ = es
			break
		case 'et':
			locale_ = et
			break
		case 'eu':
			locale_ = eu
			break
		case 'fa-ir':
			locale_ = faIR
			break
		case 'fi':
			locale_ = fi
			break
		case 'fr':
			locale_ = fr
			break
		case 'fr-ca':
			locale_ = frCA
			break
		case 'fr-ch':
			locale_ = frCH
			break
		case 'gd':
			locale_ = gd
			break
		case 'gl':
			locale_ = gl
			break
		case 'gu':
			locale_ = gu
			break
		case 'he':
			locale_ = he
			break
		case 'hi':
			locale_ = hi
			break
		case 'hr':
			locale_ = hr
			break
		case 'ht':
			locale_ = ht
			break
		case 'hu':
			locale_ = hu
			break
		case 'hy':
			locale_ = hy
			break
		case 'id':
			locale_ = id
			break
		case 'is':
			locale_ = is
			break
		case 'it':
			locale_ = it
			break
		case 'ja':
			locale_ = ja
			break
		case 'ka':
			locale_ = ka
			break
		case 'kk':
			locale_ = kk
			break
		case 'kn':
			locale_ = kn
			break
		case 'ko':
			locale_ = ko
			break
		case 'lb':
			locale_ = lb
			break
		case 'lt':
			locale_ = lt
			break
		case 'lv':
			locale_ = lv
			break
		case 'mk':
			locale_ = mk
			break
		case 'mn':
			locale_ = mn
			break
		case 'ms':
			locale_ = ms
			break
		case 'mt':
			locale_ = mt
			break
		case 'nb':
			locale_ = nb
			break
		case 'nl':
			locale_ = nl
			break
		case 'nl-be':
			locale_ = nlBE
			break
		case 'nn':
			locale_ = nn
			break
		case 'pl':
			locale_ = pl
			break
		case 'pt':
			locale_ = pt
			break
		case 'pt-br':
			locale_ = ptBR
			break
		case 'ro':
			locale_ = ro
			break
		case 'ru':
			locale_ = ru
			break
		case 'sk':
			locale_ = sk
			break
		case 'sl':
			locale_ = sl
			break
		case 'sq':
			locale_ = sq
			break
		case 'sr':
			locale_ = sr
			break
		case 'sr-latn':
			locale_ = srLatn
			break
		case 'sv':
			locale_ = sv
			break
		case 'ta':
			locale_ = ta
			break
		case 'te':
			locale_ = te
			break
		case 'th':
			locale_ = th
			break
		case 'tr':
			locale_ = tr
			break
		case 'ug':
			locale_ = ug
			break
		case 'uk':
			locale_ = uk
			break
		case 'uz':
			locale_ = uz
			break
		case 'vi':
			locale_ = vi
			break
		case 'zh-cn':
			locale_ = zhCN
			break
		case 'zh-tw':
			locale_ = zhTW
			break

		default:
			locale_ = enUS
	}

	return locale_
}

export default getLocale
