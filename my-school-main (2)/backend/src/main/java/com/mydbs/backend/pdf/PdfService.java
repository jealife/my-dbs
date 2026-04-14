package com.mydbs.backend.pdf;

import com.mydbs.backend.common.exception.ResourceNotFoundException;
import com.mydbs.backend.grades.model.Bulletin;
import com.mydbs.backend.grades.model.GradeBook;
import com.mydbs.backend.grades.model.GradeItem;
import com.mydbs.backend.grades.model.GradeItemType;
import com.mydbs.backend.grades.repository.BulletinRepository;
import com.mydbs.backend.grades.repository.GradeBookRepository;
import com.mydbs.backend.grades.repository.GradeItemRepository;
import com.itextpdf.kernel.colors.Color;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Génération PDF — Système LMD.
 *
 * Bulletin moderne organisé par Unité d'Enseignement (UE) avec :
 *  - Colonne MATIERES
 *  - 3 notes CC (N1, N2, N3)
 *  - Note Examen
 *  - Crédits / Matière
 *  - Crédits Acquis
 *  - Moyenne
 *  - Résultat (ADMIS / AJOURNÉ)
 */
@Service
@Transactional(readOnly = true)
public class PdfService {

    // ── Palette de couleurs ──────────────────────────────────────────────────
    private static final Color PRIMARY    = new DeviceRgb(30, 58, 138);   // bleu marine
    private static final Color SECONDARY  = new DeviceRgb(59, 130, 246);  // bleu moyen
    private static final Color UE_BG      = new DeviceRgb(239, 246, 255); // bleu très clair
    private static final Color HEADER_BG  = new DeviceRgb(30, 58, 138);   // même que PRIMARY
    private static final Color PASS_GREEN = new DeviceRgb(22, 163, 74);
    private static final Color FAIL_RED   = new DeviceRgb(220, 38, 38);
    private static final Color LIGHT_GRAY = new DeviceRgb(248, 250, 252);
    private static final Color BORDER_CLR = new DeviceRgb(203, 213, 225);

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final BulletinRepository bulletinRepository;
    private final GradeBookRepository gradeBookRepository;
    private final GradeItemRepository gradeItemRepository;

    public PdfService(BulletinRepository bulletinRepository,
                      GradeBookRepository gradeBookRepository,
                      GradeItemRepository gradeItemRepository) {
        this.bulletinRepository = bulletinRepository;
        this.gradeBookRepository = gradeBookRepository;
        this.gradeItemRepository = gradeItemRepository;
    }

    // ── BULLETIN PDF ─────────────────────────────────────────────────────────

    public byte[] generateBulletinPdf(Long bulletinId) {
        Bulletin bulletin = bulletinRepository.findById(bulletinId)
                .orElseThrow(() -> new ResourceNotFoundException("Bulletin introuvable : " + bulletinId));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
             Document doc = new Document(pdf)) {

            doc.setMargins(30, 36, 30, 36);

            // ── En-tête institutionnel ────────────────────────────────────
            addInstitutionHeader(doc, bulletin);

            // ── Informations étudiant ─────────────────────────────────────
            addStudentInfoBlock(doc, bulletin);

            // ── Notes par UE ─────────────────────────────────────────────
            List<GradeBook> gradeBooks = gradeBookRepository
                    .findByStudentIdAndAcademicYearIdAndSemesterAndArchivedFalse(
                            bulletin.getStudent().getId(),
                            bulletin.getAcademicYear().getId(),
                            bulletin.getSemester());

            Map<String, List<GradeBook>> ueGroups = groupByUe(gradeBooks);
            addGradeTable(doc, ueGroups);

            // ── Résumé et délibération ────────────────────────────────────
            addSummaryBlock(doc, bulletin);

            // ── Signatures ───────────────────────────────────────────────
            addSignatureBlock(doc, bulletin);

            // ── Pied de page ──────────────────────────────────────────────
            addFooter(doc);

        } catch (Exception e) {
            throw new RuntimeException("Erreur génération PDF bulletin : " + e.getMessage(), e);
        }
        return baos.toByteArray();
    }

    // ── RELEVÉ DE NOTES PDF ───────────────────────────────────────────────────

    public byte[] generateTranscriptPdf(Long studentId, Long academicYearId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdf = new PdfDocument(writer);
             Document doc = new Document(pdf)) {

            doc.setMargins(30, 36, 30, 36);

            // Titre
            doc.add(new Paragraph("RELEVÉ DE NOTES OFFICIEL")
                    .setFontSize(16).setBold()
                    .setFontColor(ColorConstants.WHITE)
                    .setBackgroundColor(PRIMARY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setPadding(12));
            doc.add(new Paragraph(" ").setFontSize(6));

            List<GradeBook> gradeBooks = academicYearId != null
                    ? gradeBookRepository.findByStudentIdAndAcademicYearIdAndArchivedFalseOrderByCourseTitle(studentId, academicYearId)
                    : gradeBookRepository.findByStudentIdAndArchivedFalseOrderByCourseTitle(studentId);

            if (gradeBooks.isEmpty()) {
                doc.add(new Paragraph("Aucune note disponible.").setFontSize(11));
            } else {
                Map<String, List<GradeBook>> bySemester = groupBySemester(gradeBooks);
                for (Map.Entry<String, List<GradeBook>> entry : bySemester.entrySet()) {
                    doc.add(new Paragraph("Semestre : " + entry.getKey())
                            .setFontSize(12).setBold().setFontColor(PRIMARY)
                            .setMarginTop(10).setMarginBottom(4));
                    addGradeTable(doc, groupByUe(entry.getValue()));
                    doc.add(new Paragraph(" ").setFontSize(4));
                }
            }

            doc.add(new Paragraph("Document officiel MyDBS — " + java.time.LocalDate.now().format(DATE_FMT))
                    .setFontSize(8).setFontColor(ColorConstants.GRAY).setTextAlignment(TextAlignment.CENTER));

        } catch (Exception e) {
            throw new RuntimeException("Erreur génération PDF relevé : " + e.getMessage(), e);
        }
        return baos.toByteArray();
    }

    // ── PRIVATE BUILDERS ─────────────────────────────────────────────────────

    private void addInstitutionHeader(Document doc, Bulletin bulletin) {
        // Bandeau supérieur bleu
        Table hdrTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(PRIMARY)
                .setBorder(Border.NO_BORDER);

        Cell leftCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(14);
        leftCell.add(new Paragraph("MyDBS")
                .setFontSize(22).setBold().setFontColor(ColorConstants.WHITE));
        leftCell.add(new Paragraph("Plateforme Académique")
                .setFontSize(9).setFontColor(new DeviceRgb(147, 197, 253)));

        Cell rightCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(14)
                .setTextAlignment(TextAlignment.RIGHT);
        rightCell.add(new Paragraph("BULLETIN DE NOTES")
                .setFontSize(16).setBold().setFontColor(ColorConstants.WHITE));
        rightCell.add(new Paragraph("Système LMD")
                .setFontSize(9).setFontColor(new DeviceRgb(147, 197, 253)));

        hdrTable.addCell(leftCell);
        hdrTable.addCell(rightCell);
        doc.add(hdrTable);
        doc.add(new Paragraph(" ").setFontSize(6));
    }

    private void addStudentInfoBlock(Document doc, Bulletin bulletin) {
        String studentName = bulletin.getStudent().getFirstName() + " " + bulletin.getStudent().getLastName();
        String yearLabel = bulletin.getAcademicYear().getName() != null ? bulletin.getAcademicYear().getName() : "";

        // Ligne de séparation avec texte
        doc.add(new Paragraph("INFORMATIONS ÉTUDIANT")
                .setFontSize(8).setBold()
                .setFontColor(SECONDARY)
                .setCharacterSpacing(1.5f)
                .setMarginBottom(4));

        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{25, 25, 25, 25}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(new SolidBorder(BORDER_CLR, 0.5f))
                .setBackgroundColor(LIGHT_GRAY);

        infoTable.addCell(infoCell("NOM & PRÉNOMS", studentName));
        infoTable.addCell(infoCell("N° ÉTUDIANT", bulletin.getStudent().getStudentNumber() != null
                ? bulletin.getStudent().getStudentNumber() : "—"));
        infoTable.addCell(infoCell("SEMESTRE", bulletin.getSemester() != null ? bulletin.getSemester() : "—"));
        infoTable.addCell(infoCell("ANNÉE ACADÉMIQUE", yearLabel));

        String cohortName = bulletin.getCohort() != null ? bulletin.getCohort().getName() : "—";
        String parcours = "LICENCE"; // valeur par défaut — peut venir du programme
        String niveau = resolveNiveau(bulletin.getSemester());

        infoTable.addCell(infoCell("FILIÈRE / OPTION", cohortName));
        infoTable.addCell(infoCell("PARCOURS", parcours));
        infoTable.addCell(infoCell("NIVEAU", niveau));
        infoTable.addCell(infoCell("STATUT", bulletin.getStatus() != null ? bulletin.getStatus().name() : "—"));

        doc.add(infoTable);
        doc.add(new Paragraph(" ").setFontSize(8));
    }

    private void addGradeTable(Document doc, Map<String, List<GradeBook>> ueGroups) {
        // En-têtes du tableau de notes
        float[] colWidths = {32, 8, 8, 8, 10, 9, 9, 8, 8};
        Table table = new Table(UnitValue.createPercentArray(colWidths))
                .setWidth(UnitValue.createPercentValue(100))
                .setFontSize(8);

        // Ligne d'en-tête principale
        addGradeTableHeaders(table);

        for (Map.Entry<String, List<GradeBook>> entry : ueGroups.entrySet()) {
            String ueLabel = entry.getKey();
            List<GradeBook> books = entry.getValue();

            // Ligne UE
            table.addCell(new Cell(1, 9)
                    .add(new Paragraph(ueLabel).setBold().setFontSize(8.5f).setFontColor(PRIMARY))
                    .setBackgroundColor(UE_BG)
                    .setBorder(new SolidBorder(BORDER_CLR, 0.5f))
                    .setPadding(5));

            for (GradeBook gb : books) {
                List<GradeItem> items = gradeItemRepository
                        .findByGradeBookIdAndArchivedFalseOrderByCreatedAtDesc(gb.getId());

                // Extraire N1, N2, N3, Examen
                Double n1 = extractNote(items, GradeItemType.CONTINUOUS_ASSESSMENT, 0);
                Double n2 = extractNote(items, GradeItemType.CONTINUOUS_ASSESSMENT, 1);
                Double n3 = extractNote(items, GradeItemType.CONTINUOUS_ASSESSMENT, 2);
                Double exam = extractNote(items, GradeItemType.FINAL_EXAM, 0);
                if (exam == null) exam = extractNote(items, GradeItemType.EVALUATION, 0);

                Double avg = gb.getWeightedAverage();
                int creditsCourse = gb.getCredits() != null ? gb.getCredits() : 0;
                int creditsAcquired = gb.isValidated() ? creditsCourse : 0;
                String result = gb.isValidated() ? "ADMIS" : "AJOURNÉ";

                String courseTitle = gb.getCourse() != null ? gb.getCourse().getTitle() : "—";

                table.addCell(dataCell(courseTitle, TextAlignment.LEFT, false, null));
                table.addCell(dataCell(fmtNote(n1), TextAlignment.CENTER, false, null));
                table.addCell(dataCell(fmtNote(n2), TextAlignment.CENTER, false, null));
                table.addCell(dataCell(fmtNote(n3), TextAlignment.CENTER, false, null));
                table.addCell(dataCell(fmtNote(exam), TextAlignment.CENTER, false, null));
                table.addCell(dataCell(String.valueOf(creditsCourse), TextAlignment.CENTER, false, null));
                table.addCell(dataCell(String.valueOf(creditsAcquired), TextAlignment.CENTER, false, null));
                table.addCell(dataCell(avg != null ? String.format("%.2f", avg) : "—",
                        TextAlignment.CENTER, false, null));
                table.addCell(dataCell(result, TextAlignment.CENTER, true,
                        gb.isValidated() ? PASS_GREEN : FAIL_RED));
            }
        }

        doc.add(table);
    }

    private void addGradeTableHeaders(Table table) {
        // Groupe NOTES D'EVALUATIONS sur 3 colonnes
        table.addHeaderCell(thCell("MATIÈRES", 2, 1, TextAlignment.LEFT));
        table.addHeaderCell(new Cell(1, 3)
                .add(new Paragraph("NOTES D'ÉVALUATIONS").setFontSize(7.5f).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(HEADER_BG)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(new DeviceRgb(59, 91, 219), 0.5f))
                .setPadding(4)
                .setVerticalAlignment(VerticalAlignment.MIDDLE));
        table.addHeaderCell(thCell("NOTE\nEXAMEN", 2, 1, TextAlignment.CENTER));
        table.addHeaderCell(thCell("CRÉDITS\n/MATIÈRE", 2, 1, TextAlignment.CENTER));
        table.addHeaderCell(thCell("CRÉDITS\nACQUIS", 2, 1, TextAlignment.CENTER));
        table.addHeaderCell(thCell("MOYENNE", 2, 1, TextAlignment.CENTER));
        table.addHeaderCell(thCell("RÉSULTAT", 2, 1, TextAlignment.CENTER));

        // Sous-lignes N1, N2, N3
        // (la première cellule MATIÈRES et les colonnes de droite ont rowspan=2)
        table.addHeaderCell(thCell("N1", 1, 1, TextAlignment.CENTER));
        table.addHeaderCell(thCell("N2", 1, 1, TextAlignment.CENTER));
        table.addHeaderCell(thCell("N3", 1, 1, TextAlignment.CENTER));
    }

    private void addSummaryBlock(Document doc, Bulletin bulletin) {
        doc.add(new Paragraph(" ").setFontSize(6));

        Table summary = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(new SolidBorder(BORDER_CLR, 0.5f));

        // Côté gauche — statistiques
        Cell leftCol = new Cell().setBorder(Border.NO_BORDER).setPadding(10);
        leftCol.add(new Paragraph("RÉSULTAT SEMESTRIEL")
                .setFontSize(8).setBold().setFontColor(PRIMARY).setCharacterSpacing(1).setMarginBottom(6));

        addSummaryRow(leftCol, "Moyenne générale (/20)",
                bulletin.getGeneralAverage() != null ? String.format("%.2f", bulletin.getGeneralAverage()) : "—");
        addSummaryRow(leftCol, "Crédits acquis",
                (bulletin.getTotalCreditsAcquired() != null ? bulletin.getTotalCreditsAcquired() : "0")
                + " / " + (bulletin.getTotalCreditsPossible() != null ? bulletin.getTotalCreditsPossible() : "0"));
        addSummaryRow(leftCol, "Rang dans la promotion",
                bulletin.getRankInCohort() != null
                        ? bulletin.getRankInCohort() + (bulletin.getTotalStudentsInCohort() != null ? " / " + bulletin.getTotalStudentsInCohort() : "")
                        : "—");
        addSummaryRow(leftCol, "Moyenne de classe",
                bulletin.getClassAverage() != null ? String.format("%.2f", bulletin.getClassAverage()) : "—");

        // Résultat général
        String decision = bulletin.getTotalCreditsAcquired() != null && bulletin.getTotalCreditsPossible() != null
                && bulletin.getTotalCreditsAcquired() >= bulletin.getTotalCreditsPossible() ? "VALIDÉ" : "AJOURNÉ";
        if (bulletin.getCouncilDecision() != null && !bulletin.getCouncilDecision().isBlank()) {
            decision = bulletin.getCouncilDecision();
        }
        leftCol.add(new Paragraph(" ").setFontSize(4));
        leftCol.add(new Paragraph("RÉSULTAT GÉNÉRAL : " + decision)
                .setFontSize(11).setBold()
                .setFontColor(decision.contains("VALIDÉ") || decision.contains("ADMIS") ? PASS_GREEN : FAIL_RED));

        // Côté droit — appréciation
        Cell rightCol = new Cell()
                .setBorder(new SolidBorder(BORDER_CLR, 0.5f))
                .setBorderRight(Border.NO_BORDER)
                .setBorderTop(Border.NO_BORDER)
                .setBorderBottom(Border.NO_BORDER)
                .setPadding(10);
        rightCol.add(new Paragraph("APPRÉCIATION DU RESPONSABLE PÉDAGOGIQUE")
                .setFontSize(8).setBold().setFontColor(PRIMARY).setCharacterSpacing(1).setMarginBottom(6));
        String appreciation = bulletin.getHeadTeacherComment() != null && !bulletin.getHeadTeacherComment().isBlank()
                ? bulletin.getHeadTeacherComment() : "—";
        rightCol.add(new Paragraph(appreciation).setFontSize(9).setItalic().setFontColor(ColorConstants.DARK_GRAY));

        summary.addCell(leftCol);
        summary.addCell(rightCol);
        doc.add(summary);
    }

    private void addSignatureBlock(Document doc, Bulletin bulletin) {
        doc.add(new Paragraph(" ").setFontSize(10));

        String city = "Libreville";
        String dateStr = bulletin.getPublishedAt() != null
                ? bulletin.getPublishedAt().format(DATE_FMT)
                : java.time.LocalDate.now().format(DATE_FMT);

        doc.add(new Paragraph("Fait à " + city + ", le " + dateStr)
                .setFontSize(9).setFontColor(ColorConstants.DARK_GRAY).setTextAlignment(TextAlignment.RIGHT));
        doc.add(new Paragraph(" ").setFontSize(8));

        Table sigTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(Border.NO_BORDER);

        Cell leftSig = new Cell().setBorder(Border.NO_BORDER).setPadding(8).setTextAlignment(TextAlignment.CENTER);
        leftSig.add(new Paragraph("Visa Responsable Pédagogique").setFontSize(9).setBold().setFontColor(PRIMARY));
        leftSig.add(new Paragraph(" ").setFontSize(20));
        leftSig.add(new Paragraph("_______________________").setFontSize(9).setFontColor(BORDER_CLR));

        Cell rightSig = new Cell().setBorder(Border.NO_BORDER).setPadding(8).setTextAlignment(TextAlignment.CENTER);
        rightSig.add(new Paragraph("Le Directeur Général").setFontSize(9).setBold().setFontColor(PRIMARY));
        rightSig.add(new Paragraph(" ").setFontSize(20));
        rightSig.add(new Paragraph("_______________________").setFontSize(9).setFontColor(BORDER_CLR));

        sigTable.addCell(leftSig);
        sigTable.addCell(rightSig);
        doc.add(sigTable);
    }

    private void addFooter(Document doc) {
        doc.add(new Paragraph(" ").setFontSize(6));
        doc.add(new Paragraph("Document généré automatiquement par MyDBS — " + java.time.LocalDate.now().format(DATE_FMT)
                + " | Ce document est officiel et confidentiel.")
                .setFontSize(7)
                .setFontColor(new DeviceRgb(148, 163, 184))
                .setTextAlignment(TextAlignment.CENTER));
    }

    // ── HELPER METHODS ───────────────────────────────────────────────────────

    /** Groupe les grade books par label UE (code + nom ou "Sans UE") */
    private Map<String, List<GradeBook>> groupByUe(List<GradeBook> gradeBooks) {
        Map<String, List<GradeBook>> result = new LinkedHashMap<>();
        for (GradeBook gb : gradeBooks) {
            String key;
            if (gb.getCourse() != null && gb.getCourse().getTeachingUnit() != null) {
                var ue = gb.getCourse().getTeachingUnit();
                key = ue.getCode() + " : " + ue.getName();
            } else {
                key = "Cours sans UE";
            }
            result.computeIfAbsent(key, k -> new ArrayList<>()).add(gb);
        }
        return result;
    }

    /** Groupe les grade books par semestre */
    private Map<String, List<GradeBook>> groupBySemester(List<GradeBook> gradeBooks) {
        Map<String, List<GradeBook>> result = new LinkedHashMap<>();
        for (GradeBook gb : gradeBooks) {
            String sem = gb.getSemester() != null ? gb.getSemester()
                    : (gb.getCourse() != null && gb.getCourse().getSemester() != null
                    ? gb.getCourse().getSemester() : "N/A");
            result.computeIfAbsent(sem, k -> new ArrayList<>()).add(gb);
        }
        return result;
    }

    /** Extrait une note d'un type donné à l'indice i (CC 0/1/2 = N1/N2/N3) */
    private Double extractNote(List<GradeItem> items, GradeItemType type, int index) {
        var filtered = items.stream()
                .filter(it -> it.getItemType() == type)
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .toList();
        if (index >= filtered.size()) return null;
        GradeItem item = filtered.get(index);
        if (item.getMaxScore() == null || item.getMaxScore() <= 0) return null;
        return Math.round((item.getScore() / item.getMaxScore()) * 20.0 * 100.0) / 100.0;
    }

    private String fmtNote(Double note) {
        return note != null ? String.format("%.2f", note) : "—";
    }

    private String resolveNiveau(String semester) {
        if (semester == null) return "—";
        return switch (semester.toUpperCase()) {
            case "S1", "S2" -> "1ère Année";
            case "S3", "S4" -> "2ème Année";
            case "S5", "S6" -> "3ème Année";
            default -> "—";
        };
    }

    // ── CELL BUILDERS ────────────────────────────────────────────────────────

    private Cell thCell(String text, int rowspan, int colspan, TextAlignment align) {
        return new Cell(rowspan, colspan)
                .add(new Paragraph(text).setFontSize(7.5f).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(HEADER_BG)
                .setTextAlignment(align)
                .setBorder(new SolidBorder(new DeviceRgb(59, 91, 219), 0.5f))
                .setPadding(4)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);
    }

    private Cell dataCell(String text, TextAlignment align, boolean colored, Color color) {
        Cell cell = new Cell()
                .add(new Paragraph(text != null ? text : "—").setFontSize(8))
                .setTextAlignment(align)
                .setBorder(new SolidBorder(BORDER_CLR, 0.3f))
                .setPaddingTop(4).setPaddingBottom(4)
                .setPaddingLeft(5).setPaddingRight(5)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);
        if (colored && color != null) {
            cell.setFontColor(color).setBold();
        }
        return cell;
    }

    private Cell infoCell(String label, String value) {
        Cell cell = new Cell().setBorder(new SolidBorder(BORDER_CLR, 0.5f)).setPadding(8);
        cell.add(new Paragraph(label).setFontSize(7).setFontColor(SECONDARY).setCharacterSpacing(0.5f));
        cell.add(new Paragraph(value != null ? value : "—").setFontSize(9).setBold().setFontColor(PRIMARY));
        return cell;
    }

    private void addSummaryRow(Cell container, String label, String value) {
        Table row = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(Border.NO_BORDER)
                .setMarginBottom(3);
        row.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(label).setFontSize(8.5f).setFontColor(ColorConstants.DARK_GRAY)));
        row.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(value).setFontSize(8.5f).setBold().setFontColor(PRIMARY))
                .setTextAlignment(TextAlignment.RIGHT));
        container.add(row);
    }
}
