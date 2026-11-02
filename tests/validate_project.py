#!/usr/bin/env python3
"""Semakan statik ringan untuk struktur projek Apps Script SK@S."""

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_SERVER_FILES = {
    "Code.gs",
    "Config.gs",
    "Setup.gs",
    "Auth.gs",
    "StandardService.gs",
    "ItemService.gs",
    "AnalyticsService.gs",
    "ActionPlanService.gs",
    "DocumentService.gs",
    "LinkService.gs",
    "AdminService.gs",
}
REQUIRED_PAGES = {
    "Login.html",
    "Dashboard.html",
    "Standard.html",
    "Item.html",
    "AnalisisTahunan.html",
    "PelanTindakan.html",
    "Dokumen.html",
    "LinkPengisian.html",
    "Tetapan.html",
}


def main() -> None:
    """Pastikan fail wajib, partial HTML dan nama fungsi pelayan konsisten."""
    existing = {path.name for path in ROOT.iterdir() if path.is_file()}
    assert "DEPLOYMENT_CHECKLIST.md" in existing, (
        "Senarai fail deployment wajib disediakan."
    )
    missing = (REQUIRED_SERVER_FILES | REQUIRED_PAGES) - existing
    assert not missing, f"Fail wajib tiada: {sorted(missing)}"

    index = (ROOT / "Index.html").read_text(encoding="utf-8")
    includes = set(re.findall(r"include\('([^']+)'\)", index))
    for include_name in includes:
        assert (ROOT / f"{include_name}.html").exists(), (
            f"Partial tidak ditemui: {include_name}.html"
        )

    standard_page = (ROOT / "Standard.html").read_text(encoding="utf-8")
    assert 'id="stdName"' not in standard_page, (
        "Medan Nama Standard tidak sepatutnya berada dalam borang."
    )
    assert 'id="quickAddYear"' in index and 'id="quickYearForm"' in index, (
        "Kawalan pantas Tambah Tahun tidak lengkap."
    )
    assert 'id="inlineAddYear"' in standard_page, (
        "Butang Tambah Tahun mesti kelihatan pada borang Skor Standard."
    )
    assert "include('Login')" in index and 'id="sidebarAddYear"' in index, (
        "Skrin login atau menu sidebar Tambah Tahun tidak lengkap."
    )
    login_page = (ROOT / "Login.html").read_text(encoding="utf-8")
    assert 'id="loginSchoolLogo"' in login_page, "Lencana login tidak ditemui."
    assert "1byIjETieWJNW1XYMzIYmoDZLh_4MNubc" in login_page, (
        "Pautan lencana sekolah tidak lengkap."
    )
    assert "A001" in login_page and "A002" in login_page, (
        "Panduan kata laluan permulaan mengikut peranan tiada."
    )
    assert 'id="loginUserId"' not in login_page, (
        "Muka login kata laluan sahaja tidak boleh meminta ID pengguna."
    )
    assert 'id="loginPassword"' in login_page, "Medan kata laluan login tiada."

    setup_service = (ROOT / "Setup.gs").read_text(encoding="utf-8")
    assert "syncDefaultPasswords_" in setup_service, (
        "Penyelarasan kata laluan pengguna lama tiada."
    )

    item_page = (ROOT / "Item.html").read_text(encoding="utf-8")
    item_service = (ROOT / "ItemService.gs").read_text(encoding="utf-8")
    assert 'id="itemPercentage"' in item_page, "Ringkasan peratus standard tiada."
    assert 'id="itemOfficialPercentage"' in item_page, (
        "Medan peratus standard rasmi tiada."
    )
    assert "saveOfficialStandardPercentage_" in item_service, (
        "Peratus standard rasmi tidak disimpan kepada rekod standard."
    )

    action_page = (ROOT / "PelanTindakan.html").read_text(encoding="utf-8")
    for field_id in ("actFocus", "actTov", "actObjective", "actIntervention",
                     "actPeriod", "actResponsibility", "actStatus"):
        assert f'id="{field_id}"' in action_page, (
            f"Medan Pelan Tindakan tiada: {field_id}"
        )
    assert '<th>Tahun</th><th>Fokus Utama</th>' in action_page, (
        "Jadual Pelan Tindakan mesti memaparkan kolum Tahun terlebih dahulu."
    )
    assert action_page.index('id="actionRows"') < action_page.index('id="actionEditor"'), (
        "Jadual Pelan Tindakan mesti berada di atas editor pengisian."
    )
    assert 'id="openActionEditor"' in action_page and 'admin-only' in action_page, (
        "Butang tambah Pelan Tindakan untuk ADMIN tiada."
    )
    config = (ROOT / "Config.gs").read_text(encoding="utf-8")
    for status in ("TELAH DILAKSANAKAN", "BELUM DILAKSANAKAN",
                   "SEDANG DILAKSANAKAN"):
        assert status in config, f"Status pelaksanaan tiada: {status}"

    annual_page = (ROOT / "AnalisisTahunan.html").read_text(encoding="utf-8")
    annual_client = (ROOT / "ClientAnalysis.html").read_text(encoding="utf-8")
    assert 'id="annualEmpty"' in annual_page, "Mesej keadaan kosong Analisis Tahunan tiada."
    assert "_authToken: state.authToken" in annual_client, (
        "Analisis Tahunan mesti menghantar token sesi secara eksplisit."
    )
    assert "createAuthSession_" in (ROOT / "Auth.gs").read_text(encoding="utf-8"), (
        "Sesi tahan-cache untuk login kata laluan tiada."
    )

    document_page = (ROOT / "Dokumen.html").read_text(encoding="utf-8")
    assert "Fail Digital SK@S" in document_page, "Nama modul Fail Digital SK@S tiada."
    assert "Fail Digital SK@S" in index, "Nama sidebar Fail Digital SK@S tiada."
    assert 'id="docStandard"' not in document_page and 'id="docNote"' not in document_page, (
        "Borang Fail Digital tidak boleh memaparkan Standard atau Catatan."
    )
    assert document_page.index('id="docRows"') < document_page.index('id="documentEditor"'), (
        "Senarai Fail Digital mesti dipaparkan sebelum borang muat naik."
    )
    assert '<th>Tahun</th><th>Kategori</th><th>Nama Dokumen</th><th>Tindakan</th>' in document_page, (
        "Jadual Fail Digital mesti mempunyai empat kolum yang ditetapkan."
    )
    assert 'id="docFilterYear"' in document_page and 'id="docFilterCategory"' in document_page, (
        "Penapis tahun atau kategori Fail Digital tiada."
    )
    document_client = (ROOT / "ClientDocumentAdmin.html").read_text(encoding="utf-8")
    assert "Salin" not in document_client, "Butang Salin mesti dibuang."
    assert "editDocument" in document_client and "updateDocument" in (
        ROOT / "DocumentService.gs"
    ).read_text(encoding="utf-8"), "Fungsi edit dokumen tidak lengkap."
    expected_categories = ("CARTA", "SURAT LANTIKAN", "CARTA ORGANISASI SK@S SKL",
                           "TAKWIM SK@S", "PEKELILING", "PROSEDUR KUALITI",
                           "SURAT PANGGILAN", "MINIT MESYUARAT", "LAPORAN/OPR",
                           "LAIN-LAIN")
    for category in expected_categories:
        assert category in config, f"Kategori Fail Digital tiada: {category}"

    entry_link_page = (ROOT / "LinkPengisian.html").read_text(encoding="utf-8")
    assert "Link Pengisian" in index and "include('LinkPengisian')" in index, (
        "Sidebar atau halaman Link Pengisian tidak lengkap."
    )
    assert '<th>Tahun</th><th>Perkara</th><th>Link/Pautan</th>' in entry_link_page, (
        "Jadual Link Pengisian mesti mempunyai Tahun, Perkara dan Link/Pautan."
    )
    assert entry_link_page.index('id="entryLinkRows"') < entry_link_page.index(
        'id="entryLinkEditor"'
    ), "Jadual Link Pengisian mesti dipaparkan sebelum borang tambah."

    function_owners: dict[str, str] = {}
    for path in ROOT.glob("*.gs"):
        source = path.read_text(encoding="utf-8")
        for function_name in re.findall(r"^function\s+([\w$]+)\s*\(", source, re.M):
            assert function_name not in function_owners, (
                f"Fungsi {function_name} diduplikasi dalam "
                f"{function_owners[function_name]} dan {path.name}"
            )
            function_owners[function_name] = path.name

    required_functions = {
        "setupSystem",
        "getInitialData",
        "getDashboardData",
        "saveStandardScore",
        "saveBulkItemScores",
        "getAnnualAnalysis",
        "getLowScoreItems",
        "saveActionPlan",
        "uploadDocument",
        "getDocuments",
        "updateDocument",
        "getEntryLinks",
        "saveEntryLink",
        "saveSettings",
        "setupDefaultLoginPasswords",
    }
    missing_functions = required_functions - function_owners.keys()
    assert not missing_functions, f"Fungsi awam tiada: {sorted(missing_functions)}"
    print(f"OK: {len(existing)} fail akar, {len(function_owners)} fungsi pelayan.")


if __name__ == "__main__":
    main()
