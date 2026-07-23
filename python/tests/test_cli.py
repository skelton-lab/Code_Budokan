from code_rookie_python.cli import main, run


def test_run_reads_file_and_totals(tmp_path):
    csv_file = tmp_path / "transactions.csv"
    csv_file.write_text("Alice, 50.0, hardware\nBob, 15.0, hardware\n")
    totals = run(str(csv_file), min_amount=20.0)
    assert totals == {"hardware": 50.0}


def test_main_returns_zero_on_success(tmp_path, capsys):
    csv_file = tmp_path / "transactions.csv"
    csv_file.write_text("Alice, 50.0, hardware\n")
    exit_code = main([str(csv_file)])
    captured = capsys.readouterr()
    assert exit_code == 0
    assert "hardware: 50.00" in captured.out


def test_main_respects_min_amount_flag(tmp_path, capsys):
    csv_file = tmp_path / "transactions.csv"
    csv_file.write_text("Alice, 50.0, hardware\nBob, 15.0, hardware\n")
    main([str(csv_file), "--min-amount", "20"])
    captured = capsys.readouterr()
    assert "hardware: 50.00" in captured.out
